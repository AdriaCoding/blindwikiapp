<?php
Yii::import('application.modules.rbam.models.*');
class UserController extends Controller
{
	/**
	 * @var string the default layout for the views. Defaults to '//layouts/column2', meaning
	 * using two-column layout. See 'protected/views/layouts/column2.php'.
	 */
	public $layout='//layouts/public';

	/**
	 * @return array action filters
	 */
	public function filters()
	{
		return array(
			'accessControl', // perform access control for CRUD operations
		);
	}

	/**
	 * Specifies the access control rules.
	 * This method is used by the 'accessControl' filter.
	 * @return array access control rules
	 */
	public function accessRules()
	{
		return array(
			array('allow',  
				'actions'=>array('admin','emails'),
				'roles'=>array(
					'ViewUserList'=>array(
						'area'=>$this->currentArea,
					)
				),
			),
			array('allow',  
				'actions'=>array('view'),
				'roles'=>array(
					'ViewUserList'=>array(
						'area'=>$this->areaOfRequestedUser,
					)
				),
			),
			array('allow', 
				'actions'=>array('create','update','hide'),
				'roles'=>array(
					'EditUser'=>array(
						'area'=>$this->areaOfRequestedUser,
					)
				),
			),
			array('allow', 
				'actions'=>array('delete'),
				'roles'=>array(
					'DeleteUser'=>array(
						'area'=>$this->areaOfRequestedUser,
					)
				),
			),
			array('allow',  
				'actions'=>array('roles'),
				'roles'=>array(
					'Auth Assignments Manager'=>array(
						'area'=>$this->currentArea,
					)
				),
			),
			array('allow',
				'actions'=>array('activate','index', 'register', 'resetPassword'),
				'users'=>array('*'),
			),
			array('allow',
				'actions'=>array('registerForum'),
				'users'=>array('*'),
				'expression'=>'($carea=Yii::app()->request->currentArea)!=null && $carea->type==Area::TYPE_FORUM',
			),
			array('allow',  
				'actions'=>array('approveAuthor', 'declineAuthor'),
				'roles'=>array(
					'AuthorizePendingUser'=>array(
						'area'=>$this->areaOfRequestedUser,
					)
				),
			),
			array('allow',
				'actions'=>array('me', 'updateMe', 'socialOn', 'socialOff', 'saveFacebookAccessToken', 
					'saveTwitterAccessToken', 'unlink', 'resendActivationEmail', 'deleteAccount'),
				'roles'=>array(
					'Authenticated'
				),
				'expression'=>'$user->model!=null',
			),
			
			array('deny',  // deny all users
				'users'=>array('*'),
			),
		);
	}

	/**
	 * Displays a particular model.
	 * @param integer $id the ID of the model to be displayed
	 */
	public function actionView($id)
	{
		$this->layout="//layouts/column2";
		$this->render('view',array(
			'model'=>$this->loadModel($id),
		));
	}

	/**
	 * Creates a new model.
	 * If creation is successful, the browser will be redirected to the 'view' page.
	 */
	public function actionCreate()
	{
	
		$this->layout="//layouts/column1";
		
		$model=new User;
		if ($this->currentArea!=null) {
			$model->current_area_id=$this->currentArea->id;
			$model->preferred_language_id=$this->currentArea->getActualDefaultLanguage();
		}
		$model->activation_status=1;
		$model->visible=1;
		$model->menu_enabled=1;
		
		// Uncomment the following line if AJAX validation is needed
		
		$this->performAjaxValidation($model);

		if(isset($_POST['User']))
		{
			$model->attributes=$_POST['User'];
			$model->password=md5($model->password);
			$model->created_device_string='admin';
			if($model->save()) {
				Yii::app()->authManager->assign('Author', $model->id, null, array());
				$this->redirect(array('view','id'=>$model->id));
				Yii::app()->end();
			}
		}

		$this->render('create',array(
			'model'=>$model,
		));
	}
	
	public function actionRegisterForum() {
		$user=new User("register_forum");
		if(isset($_POST['ajax']) && $_POST['ajax']==='register-form')
		{
			echo CActiveForm::validate($user);
			Yii::app()->end();
		}
		
		if (isset($_POST['User'])) {
			$user->attributes=$_POST['User'];
			if (!$user->validate()) throw new CException('Invalid forum registration form');
			
			$user->username=trim($user->username);
				
			$area=$this->currentArea;
			if ($area==null || $area->type!=Area::TYPE_FORUM) throw new CHttpException(400, 'Forum registration in non-forum area');
			
			$user->current_area_id=$area->id;
			$user->preferred_language_id=$area->getActualDefaultLanguage()->id;
			$user->created_device_string='web';
			$user->activation_status=1;
			$user->password=md5($user->password);
			if (!$user->save(false)) throw new CException("User could not be saved");
			Yii::app()->authManager->assign('Author',$user->id,null,array('areas'=>array($area->id)));
			$identity=UserIdentity::getIdentity($user);
			Yii::app()->user->login($identity, 3600*24*30);
			$this->redirect(array('message/index'));
		}
		else {
			throw new CException("you shouldn't be here");
		}
	}
	
	public function actionRegister() {
		
		$context='register';
		if (Yii::app()->request->isApiRequest) $context='register_api';
		
		$user=new User($context);
		if(isset($_POST['ajax']) && $_POST['ajax']==='register-form')
		{
			echo CActiveForm::validate($user);
			Yii::app()->end();
		}
		
		$this->initBreadcrumbs();
		$this->breadcrumbs[0]=I::t('menu.register');
		
		
		if (isset($_POST['User'])) {
			$user->attributes=$_POST['User'];
			if ($user->validate()) {
			
				$user->username=User::fixUsernameCase(trim($user->username));
				
				$area=$this->currentArea;
				if (Yii::app()->request->isApiRequest) {
					$area=null;
				}
				if ($area!=null && !$area->isGlobalType) throw new CHttpException(I::t('user.register.invalid_area'));
				
				if (isset($user->latitude) && $user->latitude!=0 && isset($user->longitude) && $user->longitude!=0) {
					$area=Area::findNearest($user->latitude, $user->longitude);
				}
				
				if ($area==null || $area->type!=Area::TYPE_GEO) throw new CHttpException(I::t('user.register.location_missing'));
			
				$user->current_area_id=$area->id;
				if (!$user->preferred_language_id) $user->preferred_language_id=I::currentLanguage()->id;
				if (Yii::app()->request->isApiRequest) {
					$devicename='app_unknown';
					if (isset($user->device)) {
						switch ($user->device) {
							case 'android': $devicename='app_android'; break;
							case 'ios':
							default:    $devicename='app_ios'; break;
						}
					}
					else $devicename='app_unknown';
				}
				else $devicename='web';
				$user->created_device_string=$devicename;
				$user->activation_status=0;
				if ($user->requestAuthorRole || Yii::app()->request->isApiRequest) {
					$user->pending_role='Author';
				}
			
				$user->password=md5($user->password);
				if (!$user->save(false)) throw new CException("User could not be saved");
				$user->sendActivationEmail();
				$identity=UserIdentity::getIdentity($user);
				Yii::app()->user->login($identity, 3600*24*30);
				if (Yii::app()->request->isApiRequest) {
					$apiLabels=array();
					Yii::app()->api->addAllUsefulApiLabels($apiLabels);
					echo Yii::app()->api->okResponse($user,$apiLabels,true,true,'data',array(
						'registerInfo'=>Yii::app()->api->getUserRegisterInfo(true),
					));
				}
				else {
					$this->render('registration_confirmation', array(
						'email'=>$user->email,
					));
				}
				Yii::app()->end();
			}
			else {
				if (Yii::app()->request->isApiRequest) {
					echo Yii::app()->api->errorResponse($user);
					Yii::app()->end();
				}
			}
			
		}
		else if (!Yii::app()->request->isSecureConnection && !Yii::app()->request->isApiRequest) {
			$this->redirect(Yii::app()->createAbsoluteUrl('user/register', array(), 'https'));
		}
		if (Yii::app()->request->isApiRequest) {
			$apiLabels=array();
			Yii::app()->api->addAllUsefulApiLabels($apiLabels);
			echo Yii::app()->api->okResponse(array(),$apiLabels,true,true,'data',array(
				'userRegisterInfo'=>Yii::app()->api->getUserRegisterInfo(true)
			));
		}
		else {
			
			$this->render('register', array('model'=>$user));
		}
		
	}

    public function actionDeleteAccount() {
        if (!Yii::app()->request->isApiRequest) {
            throw new CHttpException(400, "This endpoint should only be called via the API.");
        }
        $user = Yii::app()->user;
        if ($user->isGuest) throw new CHttpException(400, "You must be logged in to delete your account");
        if (empty($_POST)) {
            throw new CHttpException(400, "method must be POST");
        }
        if (empty($_POST['hash'])) {
            throw new CHttpException(400, "Field 'hash' is required");
        }
        if (!Yii::app()->api->checkUserRegisterHash($_POST['hash'])) {
            throw new CHttpException(400, "Invalid hash");
        }
        $user = User::model()->findByPk($user->id);
        if (!$user) {
            // Should be impossible  to get here
            throw new CHttpException(500, "User not found in DB");
        }
        $old_username = $user->username;
        $user->username = 'Anonymous ' . $user->id;
        $user->password = md5(md5('7777777'));
        $email = explode("@", $user->email);
        if (count($email) == 2) {
            if ($email[1] != 'gmail.com') {
                $email[0] .= '__' . $email[1];
                $email[1] = 'gmail.com';
                $user->email = implode("@", $email);
            }
        }
        $user->email = "deleted.$old_username." . $user->email;
        $user->display_name = "";
        $user->save();
        Yii::app()->db->createCommand(
            "DELETE FROM AuthAssignment WHERE userid = {$user->id}"
        )->execute();
        Yii::app()->cache->flush();
        Yii::app()->pCache->flush();
        Yii::app()->user->logout();

        Yii::app()->session->open();
        echo Yii::app()->api->okResponse(Yii::app()->user, array(), true, true, 'data', array(
            'registerInfo'=>Yii::app()->api->getUserRegisterInfo()));
        Yii::app()->end();

    }
	
	public function actionResendActivationEmail() {
		if (Yii::app()->user->model->sendActivationEmail()) {
			Yii::app()->user->setFlash('success', I::t('flashes.user.resend_act_email_success'));
			
		}
		else {
			Yii::app()->user->setFlash('error', I::t('flashes.user.resend_act_email_success'));
		}
		$this->redirect(array('user/me'));
		
	}
	
	public function actionActivate($id, $key) {
		if (($cuser=Yii::app()->user->model) && $cuser->id!=$id) {
			Yii::app()->user->logout();
			Yii::app()->session->open();
		}
		$user=User::model()->findByPk($id);
		if ($user!=null && $key!=null && trim($key!='') && !$user->activation_status && $user->activation_key==$key) {
			$user->activation_status=1;
			$user->save(false);
			$forum=$user->currentArea->getForum();
			if ($forum!=null) {
				Yii::app()->authManager->assign('Author',$user->id,null,array('areas'=>array($forum->id)));
			}
			
			$needsApproval=Yii::app()->settings->user_authorsNeedApproval;
			if (!$needsApproval && $user->pending_role=='Author') {
				$this->approveAuthor($id, false);
				$user->notifyAdmins(false);
			}
			else {
				$user->notifyAdmins();
				$user->sendWelcomeEmail();
			}
			
			$this->render('activation_confirmation', array(
				'user'=>$user,
				'needsApproval'=>$needsApproval
			));
			
		}
		else throw new CHttpException('400');
	}
	
	public function actionMe() {
		$this->layout="//layouts/public";
		$model=Yii::app()->user->getModel(true);
		
		$this->render('me', compact('model'));
	}
	
	public function actionResetPassword() {
		$this->layout="//layouts/public";
		
		$this->initBreadcrumbs();
		$this->breadcrumbs[I::t('menu.login')]=array('site/login', 'in'=>$this->currentArea);
		$this->breadcrumbs[0]=I::t('user.password_reset.title');
		
		$model=new PasswordResetForm();
		if (isset($_POST['PasswordResetForm'])) {
			$model->attributes=$_POST['PasswordResetForm'];
			if ($model->validate()) {
				$model->user->resetPassword();
				$this->render('password_reset_confirmation');
				Yii::app()->end();
			}
		}
		$this->render('reset_password', array('model'=>$model));
	}

	/**
	 * Updates a particular model.
	 * If update is successful, the browser will be redirected to the 'view' page.
	 * @param integer $id the ID of the model to be updated
	 */
	public function actionUpdate($id)
	{
		$this->layout="//layouts/column1";
		$model=User::model()->findByPk($id);
		
		
		if (isset($_POST['User'])) {
			if (isset($_POST['User']['password'])) {
				if (trim($_POST['User']['password'])=='') unset($_POST['User']['password']);
				else $_POST['User']['password']=md5($_POST['User']['password']);
			}
			if (isset($_POST['User']['new_password'])) {
				if (trim($_POST['User']['new_password'])=='') unset($_POST['User']['new_password']);
				else $_POST['User']['new_password']=md5($_POST['User']['new_password']);
			}
			
		}
		$this->performAjaxValidation($model);
		
		if(isset($_POST['User']))
		{
			$wasVisible=intval($model->visible);
			$wasActive=intval($model->activation_status);
			$model->attributes=$_POST['User'];
			if($model->save()) {
				$dif=intval($model->visible)-$wasVisible;
				if ($dif!=0) {
					$model->updateAreaMessageCounts($dif);
				}
				
				if (!$wasActive && $model->activation_status) {
					$this->approveAuthor($model->id, false);
				}
				$this->redirect(array('view','id'=>$model->id));
			}
		}
		unset($model->password);
		unset($model->new_password);
		
		$this->render('update',array(
			'model'=>$model,
		));
	}
	
	public function actionUpdateMe() {
		$this->layout="//layouts/public";
		$model=User::model()->findByPk(Yii::app()->user->id);
		$model->scenario="update_me";
		$model->password_repeat=$model->password;
		if (isset($_POST['User']) && isset($_POST['User']['password']) && trim($_POST['User']['password'])=='')
			unset($_POST['User']['password']);
		if (isset($_POST['User']) && isset($_POST['User']['password_repeat']) && trim($_POST['User']['password_repeat'])=='')
			unset($_POST['User']['password_repeat']);
		$this->performAjaxValidation($model);
		if (isset($_POST['User'])) {
			$passwordUpdated=false;
			if (isset($_POST['User']['password']) && trim($_POST['User']['password'])!='') {
				$_POST['User']['password']=md5($_POST['User']['password']);
				$_POST['User']['password_repeat']=md5($_POST['User']['password_repeat']);
				$passwordUpdated=true;
			}
			$model->attributes=$_POST['User'];
			
			if ($model->save()) {
				if ($passwordUpdated) {
					$model->new_password='';
					$model->password_reset_date=null;
					$model->save(false);
				}
				$this->redirect(array('me'));
			}
		}
		$model->password=null;
		$model->password_repeat=null;
		$this->render('updateMe', array(
			'model'=>$model,
		));
	}
	
	public function actionApproveAuthor($id) {
		$info=$this->approveAuthor($id, true);
		if (($success=$info['success'])!='') Yii::app()->user->setFlash('success', $success);
		if (($error=$info['error'])!='') Yii::app()->user->setFlash('error', $error);
		
		$this->redirect(array('/user/view', 'id'=>$id));
	}
	private function approveAuthor($id, $manual=true) {
		$user=User::model()->findByPk($id);
		if ($user==null) throw new CHttpException(404, 'User not found');
		$assignment=Yii::app()->authManager->getAuthAssignment('Author', $id);
		if ($assignment===null) {
			Yii::app()->authManager->assign('Author', $id, null, array());
		}
		else {
			$assignment->data=array();
			Yii::app()->authManager->saveAuthAssignment($assignment);
		}
		$user->pending_role='';
		$error='';
		$success='';
		if ($user->save(false)) {
			$success.=I::t('admin.approvals.update_success')." ";
		}
		else {
			Yii::log('Error saving user '.print_r($user->errors,true), 'error');
			$error.=I::t('admin.approvals.update_error')." ";
		}
		
		if ($user->sendApprovalEmail($manual)) {
			$success.=I::t('admin.send_email_success')." ";
		}
		else {
			$error.=I::t('admin.send_email_error')." ";
		}
		
		return array('success'=>$success, 'error'=>$error);
	}
	public function actionDeclineAuthor($id) {
		$user=User::model()->findByPk($id);
		if ($user==null) throw new CHttpException(404, 'User not found');
		$user->pending_role='';
		$error='';
		$success='';
		if ($user->save(false)) {
			$success.=I::t('admin.approvals.update_success')." ";
		}
		else {
			Yii::log('Error saving user '.print_r($user->errors,true), 'error');
			$error.=I::t('admin.approvals.update_error')." ";
		}
		if ($user->sendDenialEmail()) {
			$success.=I::t('admin.send_email_success')." ";
		}
		else {
			$error.=I::t('admin.send_email_error')." ";
		}
		if ($success!='') Yii::app()->user->setFlash('success', $success);
		if ($error!='') Yii::app()->user->setFlash('error', $error);
		
		$this->redirect(array('/user/view', 'id'=>$id));
	}

	/**
	 * Deletes a particular model.
	 * If deletion is successful, the browser will be redirected to the 'admin' page.
	 * @param integer $id the ID of the model to be deleted
	 */
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
	
	public function actionEmails($byLang = false) {
		
		if ($this->currentArea) {
			$wherecountry="area.id IN(".implode(',',$this->currentArea->getDescendantIds(true)).")";
		}
		else $wherecountry="1=1";
		
		if ($byLang) {
			$langs = Yii::app()->db->createCommand(array(
				'select'=>'id, name',
				'from'=>'language',
				'where'=>'1'
			))->queryAll();
			
			foreach ($langs as $lang) {
				$emails=Yii::app()->db->createCommand(array(
					'select'=>'DISTINCT(email)',
					'from'=>'user',
					'join'=>'JOIN area ON user.current_area_id=area.id AND area.visible > 0 ' .
							'JOIN message ON message.author_user_id = user.id AND message.visible > 0',
					'where'=>'area.visible>0 AND '. $wherecountry . ' AND user.visible > 0 AND preferred_language_id = ' . $lang['id']
				))->queryColumn();
				if (!empty($emails)) {
					echo $lang['name'] . ":<br>\n";
					echo implode(", ", $emails) . "\n<br><br><br>\n\n";
				}
			}
			
		}
		else {
			$emails=Yii::app()->db->createCommand(array(
				'select'=>'email',
				'from'=>'user',
				'join'=>'JOIN area ON user.current_area_id=area.id',
				'where'=>'area.visible>0 AND '.$wherecountry
			))->queryColumn();
			echo implode(", ", $emails);
		}
		
		
	}
	
	/**
	 * Lists all models.
	 */
	public function actionIndex()
	{
		$criteria=new CDbCriteria();
		$ortest=Utils::getTestVisibleOrCondition('t');
		$criteria->addCondition("t.visible>0$ortest");
		$criteria->with=array(
			'currentArea'=>array(),
			'messages'=>array(
				'select'=>'COUNT(messages.id) AS message_count',
				'joinType'=>'INNER JOIN',
				'on'=>'messages.visible>0'.
				  ($this->currentArea!=null?
				  ' AND messages.area_id='.$this->currentArea->id :
				  ''
				  )
			),
			'messages.area'=>array(
				'joinType'=>'INNER JOIN',
				'on'=>'area.visible>0'
			)
		);
		
		$order=Yii::app()->settings->user_index_default_order;
		if (isset($_GET['sort'])) {
			$order=(int)($_GET['sort']);
		}
		
		$this->initBreadcrumbs();
		$this->breadcrumbs[0]=I::t('menu.participants');		
		
		$this->render('index',array(
			'order'=>$order
		));
	}

	/**
	 * Manages all models.
	 */
	public function actionAdmin()
	{
		$this->layout="//layouts/column1";
	
		$model=new User('search');
		$model->unsetAttributes();  // clear any default values
		if(isset($_GET['User']))
			$model->attributes=$_GET['User'];
		
		if ($this->currentArea==null) $areas=Area::model()->with(array('parentArea'))->findAll(array(
			'order'=>'IF (t.parent_area_id IS NULL, t.name, parentArea.name), IF (t.parent_area_id IS NULL, 0, 1), t.name' 
		));
		else $areas=array_merge(array($this->currentArea), $this->currentArea->childAreas);
		
		$pendingcondition="pending_role <> ''";
		if ($this->currentArea) $pendingcondition.=" AND current_area_id=".$this->currentArea->id;
		
		$pendingUsers=User::model()->orderByDisplayName()->findAll($pendingcondition);
		
		$this->render('admin',array(
			'model'=>$model,
			'areas'=>$areas,
			'pendingUsers'=>$pendingUsers,
		));
	}
	
	public function actionRoles($id) {
		$this->redirect(array('/rbam/authAssignments/userRolesSimple', 'uid'=>$id));
		/*
		$authAssignment = new AuthAssignment(); // $authAssignment is a CFormModel
		$form = $authAssignment->getForm();
		
		$user = User::model()->findByPk($id);
		$data = array_values(Yii::app()->authManager->getAuthAssignments($id));
		$dataProvider = new CArrayDataProvider($data,
			array(
				'pagination'=>array(
					'pageSize'=>50
				),
				'sort'=>array(
					'attributes'=>array('itemName'),
					'defaultOrder'=>array('itemName'=>false),
				)
			)
		);

		$this->pageTitle = $user->adminName." - ".I::t('user.manage_permissions');
		$this->breadcrumbs = array(
			'Users'=>array('user/admin'),
			$user->adminName => array('user/view', 'id'=>$id),
			I::t('user.manage_permissions'),
		);
		$this->render('roles', compact('user', 'dataProvider', 'form'));
		*/
	}
	
	public function actionSocialOn($app) {
		
		$appname=AccessToken::getApplicationName($app);
		
		$user=Yii::app()->user->getModel(true);
		$p="publish_$appname";
		$user->$p=true;
		$user->save(false);
		$pi=$appname.'_userid';
		if (empty($user->$pi)) $this->redirectToObtainAccessToken($app);
		else {
			$accessToken=AccessToken::model()->findByAttributes(array(
				'application'=>$app,
				'userid'=>$user->$pi,
			));
			if ($accessToken==null || !$accessToken->isValid) $this->redirectToObtainAccessToken($app);
		}
		$this->redirect(array('user/me'));
	}
	
	public function actionSocialOff($app) {
		$appname=AccessToken::getApplicationName($app);
		$user=Yii::app()->user->getModel(true);
		$p="publish_$appname";
		$user->$p=false;
		$user->save(false);
		$this->redirect(array('user/me'));
	}
	
	public function actionSaveFacebookAccessToken() {
		
		$facebook_userid=Yii::app()->facebook->saveCurrentAccessToken();
		$user=Yii::app()->user->getModel(true);
			
		$user->facebook_userid=$facebook_userid;
		$user->save(false);
		$this->redirect(array('user/me'));
	}
	
	public function actionSaveTwitterAccessToken() {
		
		$userid=Yii::app()->twitter->saveCurrentAccessToken();
		$user=Yii::app()->user->getModel(true);
			
		$user->twitter_userid=$userid;
		$user->save(false);
		$this->redirect(array('user/me'));
	}
	
	
	public function actionUnlink($app) {
		$appname=AccessToken::getApplicationName($app);
		$user=Yii::app()->user->getModel(true);
		$pi=$appname.'_userid';
		$user->$pi=null;
		$user->save(false);
		$this->redirect(Yii::app()->$appname->getLogoutUrl(array('user/me')));
	}
	
	//TODO: comment this out; parent implementation should work
	public function redirectToObtainAccessToken($app) {
		switch ($app) {
			case AccessToken::APPLICATION_FACEBOOK:
				$url=Yii::app()->facebook->getLoginUrl(array(
					'redirect_uri'=>Yii::app()->createAbsoluteUrl('user/saveFacebookAccessToken'), 
					'scope' => "read_stream,publish_stream,offline_access,user_photos"
				));
				
			break;
			case AccessToken::APPLICATION_TWITTER:
				$url=Yii::app()->twitter->getLoginUrl(array(
					'redirect_uri'=>Yii::app()->createAbsoluteUrl('user/savetwitterAccessToken')
				));
			
			break;
		}
		$this->redirect($url);
	}

	/**
	 * Returns the data model based on the primary key given in the GET variable.
	 * If the data model is not found, an HTTP exception will be raised.
	 * @param integer the ID of the model to be loaded
	 */
	public function loadModel($id)
	{
		$model=User::model()->findByPk($id);
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
		if(isset($_POST['ajax']) && $_POST['ajax']==='user-form')
		{
			echo CActiveForm::validate($model);
			Yii::app()->end();
		}
	}
}
