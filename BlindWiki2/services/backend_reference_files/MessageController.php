<?php

class MessageController extends Controller
{

	// Note: an action for old-megafone-style editing of all messages will NOT exist
	// Editing will be done in-place from the index/view view via ajax.
	// I'll call the ajax-only action "update" just in case I need a "edit" action
	// which would consist in showing the edit controls (still ajax)


	public $layout='//layouts/public';

	public function filters()
	{
		return array(
			'accessControl', 
		);
	}

	
	public function accessRules()
	{
		return array(
			array('allow',  
				'actions'=>array('index','view','processAttachments','viewSingle'),
				'users'=>array('*'),
			),
			array('allow', 
				'actions'=>array('publish'),
				'roles'=>array(
					'Publish'=> array(
						'area'=>$this->currentArea,
					)
				),
				
			),
			array('allow', 
				'actions'=>array('update','edit'),
				'roles'=>array(
					'EditMessage'=>array(
						'area'=>$this->areaOfRequestedMessage,
					),
					'EditOwnMessage'=>array(
						'area'=>$this->areaOfRequestedMessage,
						'message'=>$this->requestedMessage,
					),
				),
			),
			array('allow',
				'actions'=>array('delete'),
				'roles'=>array(
					'DeleteMessage'=>array(
						'area'=>$this->areaOfRequestedMessage,
					),
					'DeleteOwnMessage'=>array(
						'message'=>$this->requestedMessage,
					),
				),
			),
			array('allow',
				'actions'=>array('hide', 'restore'),
				'roles'=>array(
					'HideMessage'=>array(
						'area'=>$this->areaOfRequestedMessage,
					),
					'HideOwnMessage'=>array(
						'message'=>$this->requestedMessage,
					),
				),
			),
			array('allow',
				'actions'=>array('hideAttachment', 'restoreAttachment', 'rotateImageAttachment'),
				'roles'=>array(
					'EditMessage'=>array(
						'area'=>$this->requestedAttachment===null?null:$this->requestedAttachment->message->area,
					),
					'EditOwnMessage'=>array(
						'message'=>$this->requestedAttachment===null?null:$this->requestedAttachment->message,
					),
				),
			),
			
			array('deny',  // deny all users
				'users'=>array('*'),
			),
		);
	}

	
	// TODO
	public function actionView($id)
	{
		$message=Message::model()->findByPk($id);
		$realUrl=$message->getRealUrl();
		$this->redirect($realUrl);
	}

	
	public function actionPublish()
	{	
	
		if(isset($_POST['ajax']) && $_POST['ajax']==='message-form')
		{
			echo CActiveForm::validate($model);
			Yii::app()->end();
		}
		
		$message=null;
		$thanks="";
		$form=new PublishForm;
		$user=Yii::app()->user->model;
		$currentArea=Yii::app()->areaTree->currentNode;
		if ($currentArea==null) throw new CHttpException('400', 'No area defined');
		if ($user==null) throw new CException('Only real users can publish');
		if (isset($_POST['PublishForm'])) {
			$form->attributes=$_POST['PublishForm'];
			if ($form->validate()) {
				$uploadedfiles=CUploadedFile::getInstances($form,'files');
				$message=new Message;
				if ($form->longitude!="" && $form->latitude!="") {
					$message->longitude=$form->longitude;
					$message->latitude=$form->latitude;
				}
				$message->text=$form->text;
				$device=Device::get('web');
				if ($device!=null) {
					$message->device_id=$device->id;
					Yii::trace('Message device id is '.$device->id);
				}
				else Yii::trace('Cannot find a device called "web"','error');
				
				if ($message->save(false)) {
					$thanks=I::t('publish.success');
					$attsuccess=$message->createAttachments($uploadedfiles);
					$message->setTags($form->tags,$form->newtags);
					$form->text=null;
					$message=null;
					if ($currentArea->type==Area::TYPE_FORUM) $this->redirect(array('message/index'));
				}
				else {
					Attachment::saveFailedUploads($uploadedfiles);
					throw new CHttpException(500,'Form was validated but the message could not be saved');
				}

			}
		}
		
		$proposedTags=Tag::getProposedTags(Yii::app()->areaTree->currentNode, $user);
		Yii::trace('Proposed own tag count: '.count($proposedTags['own']));
		
		
		$this->render('publish',array(
			'formModel'=>$form,
			'messageModel'=>$message,
			'thanks'=>$thanks,
			'proposedTags'=>$proposedTags,
		));
	}


	// TODO (maybe Ajax only)
	public function actionUpdate($id)
	{
		$this->layout='//layouts/empty';
		$message=Message::model()->findByPk($id);

		// Uncomment the following line if AJAX validation is needed
		// $this->performAjaxValidation($model);

		if(isset($_POST['Message']))
		{
			$message->attributes=$_POST['Message'];
			if($message->save())
				$this->redirect(array('viewSingle','id'=>$message->id));
			
		}

		$this->render('_update',array(
			'message'=>$message,
		));
	}
	
	
	public function actionViewSingle($id) {
		$message=Message::model()->findByPk($id);
		$this->layout='//layouts/empty';
		$this->render('_view', array(
			'message'=>$message,
			'canEditMessage'=>(Yii::app()->user->checkAccess('EditMessage', array('area'=>$this->currentArea)) ||
								Yii::app()->user->checkAccess('EditOwnMessage', array('message'=>$message))),
			'canHideMessage'=>(Yii::app()->user->checkAccess('HideMessage', array('area'=>$this->currentArea)) ||
								Yii::app()->user->checkAccess('HideOwnMessage', array('message'=>$message))),
			'canDeleteMessage'=>(Yii::app()->user->checkAccess('DeleteMessage', array('area'=>$this->currentArea)) ||
								Yii::app()->user->checkAccess('DeleteOwnMessage', array('message'=>$message))),
			'afterEdit'=>true,
			
			
		));
	}


	// TODO (maybe ajax only)
	public function actionDelete($id)
	{
		if(Yii::app()->request->isPostRequest)
		{
			// we only allow deletion via POST request
			$this->loadModel($id)->delete();

			// if AJAX request (triggered by deletion via admin grid view), we should not redirect the browser
			if(!isset($_GET['ajax']))
				$this->redirect(isset($_POST['returnUrl']) ? $_POST['returnUrl'] : array('admin'));
		}
		else
			throw new CHttpException(400,'Invalid request. Please do not repeat this request again.');
	}
	
	public function actionHide($id) {
		$message=Message::model()->findByPk($id);
		$message->visible=false;
		$message->save();
		$this->redirect($message->getRealUrl());
	}
	public function actionRestore($id) {
		$message=Message::model()->findByPk($id);
		$message->visible=true;
		$message->save();
		$this->redirect(array('viewSingle','id'=>$message->id));
	}

	public function actionHideAttachment($attachment_id) {
		$attachment=Attachment::model()->findByPk($attachment_id);
		$attachment->visible=false;
		$attachment->save();
		$this->redirect(array('message/viewSingle', 'id'=>$attachment->message->id));
	}
	public function actionRestoreAttachment($attachment_id) {
		$attachment=Attachment::model()->findByPk($attachment_id);
		$attachment->visible=true;
		$attachment->save();
		$this->redirect(array('message/viewSingle', 'id'=>$attachment->message->id));
	}
	
	public function actionRotateImageAttachment($attachment_id, $direction) {
		$attachment=Attachment::model()->findByPk($attachment_id);
		$attachment->rotateImage($direction);
		$this->redirect(array('message/viewSingle', 'id'=>$attachment->message->id));
	}
	
	public function actionIndex()
	{
	
		
		$currentArea=Yii::app()->areaTree->currentNode;
		if ($currentArea==null) throw new CHttpException(400);
		if (isset($_GET['author_id'])) {
			$author=User::model()->findByPk($_GET['author_id']);
		}
		else $author=null;
		$tags=isset($_GET['tags'])?$_GET['tags']:null;
		
		$showHiddenMessages=Yii::app()->user->checkAccess("ViewHiddenMessages",array('area'=>$currentArea));
		$messageModel=Message::model();
		
		$query=$messageModel->createCommonFindQuery($showHiddenMessages, $currentArea, $author, $tags); 
		
		/*
		$options=array(
			'author'=>$author,
			'tags'=>$tags,
		);
		*/
		
		//$dates=$currentArea->getMessageDates($showHiddenMessages,$options);
		$dates=$messageModel->getDates($query);
		
		if (isset($_GET['date']) && $_GET['date']!=='latest') $date=$_GET['date'];
		else $date=$messageModel->getLatestDate($query);
		
		
		
		if ($date) {
			Yii::trace("Latest message date is $date");
			
			/*
			$criteria=new CDbCriteria();
			$criteria->with=array('attachments','authorUser');
			$criteria->addCondition('area_id=:areaId')
				     ->addCondition('DATE(date_time)=:date');
			if (!$showHiddenMessages) {
				$criteria->addCondition('t.visible=1');
			}
			$params=array(
				':date'=>$date,
				':areaId'=>$currentArea->id
			);
			if ($author!=null) {
				$criteria->addCondition('t.author_user_id=:authorId');
				$params[':authorId']=$author->id;
			}
			if (isset($tags)) {
				Tag::addTagsCondition($criteria,$tags);
			}
			$criteria->params=$params;
			$criteria->order='date_time DESC';
			$model=Message::model(); //->with(array('attachments','authorUser'));
			//$model->dbCriteria=$criteria;
			$messages=$model->findAll($criteria);
			*/
			$query['conditions'][]='DATE(t.date_time)=:date';
			$query['params'][':date']=$date;
			$messageData=DbHelper::createDbCommand($query)->queryAll();
			$messages=$messageModel->populateRecords($messageData);
		}
		else {
			Yii::trace('Latest message date is null');
			$messages=array();
		}
		
		$this->registerScriptGoToDate();
		
		$this->render('index',array(
			'messages'=>$messages,
			'author'=>$author,
			'dates'=>$dates,
			'date'=>$date,
			'tags'=>$tags,
			'canEdit'=>Yii::app()->user->checkAccess('EditMessage', array('area'=>$this->currentArea)),
			'canHide'=>Yii::app()->user->checkAccess('HideMessage', array('area'=>$this->currentArea)),
			'canDelete'=>Yii::app()->user->checkAccess('DeleteMessage', array('area'=>$this->currentArea)),
		));
		
	}
	
	public function registerScriptGoToDate() {
		$params=array('date'=>'__DATE__');
		if (isset($_GET['tags'])) $params['tags']=$_GET['tags'];
		if (isset($_GET['author_id'])) $params['author_id']=$_GET['author_id'];
		$baseurl=$this->createUrl('',$params);
		$cs=Yii::app()->clientScript;
		$cs->registerScript(
			'MessageController.goToUrl',
			"function goToDate(date) {
				var url='$baseurl';
				window.location=url.replace('__DATE__',date);
			}
			",
			CClientScript::POS_HEAD
		);
		
	
	}


	// TODO (and rename as actionEdit)
	public function actionAdmin()
	{
		$model=new Message('search');
		$model->unsetAttributes();  // clear any default values
		if(isset($_GET['Message']))
			$model->attributes=$_GET['Message'];

		$this->render('admin',array(
			'model'=>$model,
		));
	}

	/**
	 * Returns the data model based on the primary key given in the GET variable.
	 * If the data model is not found, an HTTP exception will be raised.
	 * @param integer the ID of the model to be loaded
	 */

	/*
	public function actionProcessAttachments($messageId) {
		if (ERunActions::runBackground()) {
			Yii::trace('Running action message/processAttachments in the background...');
			Message::model()->findByPk($messageId)->processAttachments();
		}
		else {
			Yii::trace('Action message/processAttachments launched in the background');
			if (!ERunActions::isRunActionRequest()) {
				$this->redirect(Message::model()->findByPk($messageId)->getUrl());
			}
		}
	}
	*/

	public function actionProcessAttachments($messageId, $secret='') {
		if (!Yii::app()->user->checkAccess('ProcessAttachments') && $secret!=Yii::app()->params['adminPassword']) {
			throw new CHttpException(403,'Unauthorized');
		}
		Message::model()->findByPk($messageId)->processAttachments();
		echo "done";
		//$this->redirect(array('message/view','id'=>$messageId));
	}

	public function loadModel($id)
	{
		$model=Message::model()->findByPk($id);
		if($model===null)
			throw new CHttpException(404,'The requested page does not exist.');
		return $model;
	}

	/**
	 * Performs the AJAX validation.
	 * @param CModel the model to be validated
	 */
	protected function performAjaxValidation($model)
	{
		if(isset($_POST['ajax']) && $_POST['ajax']==='message-form')
		{
			echo CActiveForm::validate($model);
			Yii::app()->end();
		}
	}
}
