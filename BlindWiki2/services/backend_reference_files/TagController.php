<?php

class TagController extends Controller
{
	/**
	 * @var string the default layout for the views. Defaults to '//layouts/column2', meaning
	 * using two-column layout. See 'protected/views/layouts/column2.php'.
	 */
	public $layout='//layouts/column2';

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
				'actions'=>array('index','view', 'autocomplete', 'proposed'),
				'users'=>array('*'),
			),
			array('allow',
				'actions'=>array('create'),
				'roles'=>array(
					'CreateTag'=>array(
						'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('edit','update'),
				'roles'=>array(
					'EditTag'=>array(
						'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('editTranslations', 'admin'),
				'roles'=>array(
					'TagTranslator'=>array(
					),
					'TagEditor'=>array(
						'area'=>$this->currentArea
					)
				)
			),
			array('allow',
				'actions'=>array('updateTranslation'),
				'roles'=>array(
					'EditTagTranslation'=>array(
						'language'=>$this->requestedLanguage,
					)
				)
			),
			array('allow',
				'actions'=>array('hide', 'restore'),
				'roles'=>array(
					'HideTag'=>array(
						'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('delete'),
				'roles'=>array(
					'DeleteTag'=>array(
						'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('makeFeatured'),
				'roles'=>array(
					'ChangeTagFeaturedStatus'=>array(
						'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('removeFeatured'),
				'roles'=>array(
					'ChangeTagFeaturedStatus'=>array(
						'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('deleteTranslationAlias'),
				'roles'=>array(
					'DeleteTagTranslationAlias'=>array(
						//'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('createTranslationAlias'),
				'roles'=>array(
					'CreateTagTranslationAlias'=>array(
						//'area'=>$this->currentArea,
					)
				)
			),
			array('allow',								// UNNECCESSARY!! Using Update!
				'actions'=>array('assignMarkerColor'),
				'roles'=>array(
					'AssignMarkerColorToTag'=>array(
						//'area'=>$this->currentArea,
					)
				)
			),
			array('allow',
				'actions'=>array('merge'),
				'roles'=>array(
					'MergeTags'=>array(
						//'area'=>$this->currentArea,
					)
				)
			),
			array('deny',  
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
		$tag=Tag::model()->findByPk($id);
		$this->render('view',array(
			'tag'=>$tag,
		));
	}

	/**
	 * Creates a new model.
	 * If creation is successful, the browser will be redirected to the 'view' page.
	 */
	public function actionCreate()
	{
		$model=new Tag;

		// Uncomment the following line if AJAX validation is needed
		// $this->performAjaxValidation($model);

		if(isset($_POST['Tag']))
		{
			$model->attributes=$_POST['Tag'];
			if($model->save())
				$this->redirect(array('view','id'=>$model->id));
		}

		$this->render('create',array(
			'model'=>$model,
		));
	}

	/**
	 * Updates a particular model.
	 * If update is successful, the browser will be redirected to the 'view' page.
	 * @param integer $id the ID of the model to be updated
	 */
	public function actionUpdate($id)
	{
		$model=$this->loadModel($id);

		// Uncomment the following line if AJAX validation is needed
		// $this->performAjaxValidation($model);

		if(isset($_POST['Tag']))
		{
			$model->attributes=$_POST['Tag'];
			if($model->save()) {
				Tag::invalidateTagClouds();
				$this->redirect(array('view','id'=>$model->id));
			}
		}

		$this->render('update',array(
			'model'=>$model,
		));
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
	
	public function actionMakeFeatured($id) {
		if(true)
		{
			$tagft=TagFeaturedArea::model()->findByAttributes(array('tag_id'=>$id, 'area_id'=>$this->currentArea->id));
			if ($tagft==null) {
				$tagft=new TagFeaturedArea();
				$tagft->tag_id=$id;
				$tagft->area_id=$this->currentArea->id;
				$tagft->visible=true;
				if (!$tagft->save(false)) throw new CException("Couldn't save featured tag");
			}

			// if AJAX request (triggered by deletion via admin grid view), we should not redirect the browser
			if(!isset($_GET['ajax']))
				$this->redirect(isset($_REQUEST['returnUrl']) ? $_REQUEST['returnUrl'] : array('tag/admin'));
		}
		else
			throw new CHttpException(400,'Invalid request. Please do not repeat this request again.');
	
	}
	public function actionRemoveFeatured($id) {
		if(true)
		{
			$tagft=TagFeaturedArea::model()->findByAttributes(array('tag_id'=>$id, 'area_id'=>$this->currentArea->id));
			if ($tagft!==null) {
				if (!$tagft->delete()) throw new CException("Couldn't remove featured tag");
			}

			// if AJAX request (triggered by deletion via admin grid view), we should not redirect the browser
			if(!isset($_GET['ajax']))
				$this->redirect(isset($_REQUEST['returnUrl']) ? $_REQUEST['returnUrl'] : array('tag/admin'));
		}
		else
			throw new CHttpException(400,'Invalid request. Please do not repeat this request again.');
	
	}
	public function actionHide($id) {
		
			$tag=Tag::model()->findByPk($id);
			if ($tag!==null) {
				$tag->visible=false;
				if (!$tag->save(false)) throw new CException("Couldn't save hidden tag");
			}
			else throw new CHttpException('404');

			// if AJAX request (triggered by deletion via admin grid view), we should not redirect the browser
			if(!isset($_GET['ajax']))
				$this->redirect(isset($_REQUEST['returnUrl']) ? $_REQUEST['returnUrl'] : array('admin'));
		
	}
	public function actionRestore($id) {
		
			$tag=Tag::model()->findByPk($id);
			if ($tag!==null) {
				$tag->visible=true;
				if (!$tag->save(false)) throw new CException("Couldn't save restored tag");
			}
			else throw new CHttpException('404');

			// if AJAX request (triggered by deletion via admin grid view), we should not redirect the browser
			if(!isset($_GET['ajax']))
				$this->redirect(isset($_REQUEST['returnUrl']) ? $_REQUEST['returnUrl'] : array('admin'));
		
	}
	public function actionDeleteTranslationAlias($alias_id) {
		$alias=TagTranslationAlias::model()->findByPk($alias_id);
		$tag=$alias->tagTranslation->tag;
		if (!$alias->delete()) throw new CException("Couldn't delete tag translation alias");
		else $this->redirect(array('tag/view', 'id'=>$tag->id));
	}
	public function actionCreateTranslationAlias() {
		if (isset($_POST['TagTranslationAlias'])) {
			$alias=new TagTranslationAlias();
			$alias->attributes=$_POST['TagTranslationAlias'];
			$alias->visible=true;
			if (!$alias->save()) throw new CHttpException(400, "Couldn't save tag translation alias ".print_r($alias->errors,true));
			
			$tag=$alias->tagTranslation->tag;
			$this->redirect(array('tag/view', 'id'=>$tag->id));
		}
		else throw new CHttpException('400', 'No data provided');
	}
	
	public function actionMerge() {
	
		$this->layout="//layouts/column1";
	
		if (!isset($_GET['tag_ids'])) {
			throw new CHttpException('400', 'No tags specified');
		}
		$tags=Tag::model()->findAllByPk(explode(',',$_GET['tag_ids']));
		
		if (count($tags)<2) throw new CHttpException('400', 'Must specify at least two valid tags');
		
		
		
		if (isset($_POST['merge-tags'])) {
			
			if (!isset($_POST['target_tag_id'])) throw new CHttpException(400, 'No target tag specified');
			$targetTag=Tag::model()->findByPk($_POST['target_tag_id']);
			if ($targetTag===null) throw new CHttpException('400', 'Cannot find target tag');
				
			$tagsAssoc=array();
			$oldTranslationsAssoc=array();
			foreach ($tags as $tag) {
				$tagsAssoc[$tag->id]=$tag;
				foreach ($tag->translations as $translation) {
					$oldTranslationsAssoc[$translation->id]=$translation;
				}
			}
			if (isset($tagsAssoc[$targetTag->id])) unset($tagsAssoc[$targetTag->id]);
			$newTranslationsByLanguage=array();
			if (isset($_POST['translations'])) {
				foreach ($_POST['translations'] as $lang=>$id) {
					$newTranslation=TagTranslation::model()->findByPk($id);
					if ($newTranslation===null) continue;
					$newTranslationsByLanguage[$lang]=$newTranslation;
				}
			}
			foreach ($newTranslationsByLanguage as $lang=>$newTranslation) {
				if (isset($oldTranslationsAssoc[$newTranslation->id])) unset ($oldTranslationsAssoc[$newTranslation->id]);
				if ($newTranslation->tag_id==$targetTag->id) continue;
				
				$targetTranslation=TagTranslation::model()->findByAttributes(array(
					'tag_id'=>$targetTag->id,
					'language_id'=>$lang,
				));
				if ($targetTranslation!==null) {
					$oldValue=$targetTranslation->value;
					$targetTranslation->value=$newTranslation->value;
					if (!$targetTranslation->save(false)) throw new CException("Couldn't update existing tag translation ".$targetTranslation->value." (".$targetTranslation->id.") for tag ".$targetTar->name." (".$targetTag->id.") with new value ".$newTranslation->value." from tag translation ".$newTranslation->id." -- ".Language::model()->findByPk($lang)->name);
					$newAlias=new TagTranslationAlias();
					$newAlias->tag_translation_id=$targetTranslation->id;
					$newAlias->value=$oldValue;
					$newAlias->visible=true;
					if (!$newAlias->save(false)) throw new CException("Couldn't save new translation alias ".$oldValue);
					foreach ($newTranslation->aliases as $oldAlias) {
						$oldAlias->tag_translation_id=$targetTranslation->id;
						if (!$oldAlias->save(false)) throw new CException("Couldn't reassign existing alias to updated translation");
					
					}
					if (isset($oldTranslationsAssoc[$targetTranslation->id])) unset ($oldTranslationsAssoc[$targetTranslation->id]);
				}
				else {
					$newTranslation->tag_id=$targetTag->id;
					if (!$newTranslation->save(false)) throw new CException("Couldn't reassign tag translation");
				}
			}
			
			foreach ($oldTranslationsAssoc as $id=>$oldTranslation) {
				$targetTranslation=TagTranslation::model()->findByAttributes(array(
					'tag_id'=>$targetTag->id,
					'language_id'=>$oldTranslation->language_id,
				));
				if ($targetTranslation===null) { // should never happen
					$oldTranslation->tag_id=$targetTag->id;
					if (!$oldTranslation->save(false)) throw new CException("Couldn't reassign fallback existing translation");
					continue;
				}
				foreach ($oldTranslation->aliases as $oldAlias) {
					$oldAlias->tag_translation_id=$targetTranslation->id;
					if (!$oldAlias->save(false)) throw new CException("Couldn't reassign old alias");
				}
				$newAlias=new TagTranslationAlias();
				$newAlias->tag_translation_id=$targetTranslation->id;
				$newAlias->value=$oldTranslation->value;
				$newAlias->visible=true;
				if (!$newAlias->save(false)) throw new Exception("Couldn't save new alias created from old translation");
			}
			
			foreach ($tagsAssoc as $oldTag) {
				Yii::app()->db->createCommand("UPDATE IGNORE tag_x_message SET tag_id=".$targetTag->id." WHERE tag_id=".$oldTag->id)->execute();
				
				Yii::app()->db->createCommand()->delete('tag_x_message', 'tag_id=:oldTagId', array(
					':oldTagId'=>$oldTag->id
				));
				
				/*
				Yii::app()->db->createCommand()->update(
					'tag_x_message',
					array(
						'tag_id'=>$targetTag->id
					),
					'tag_id=:oldTagId',
					array(
						':oldTagId'=>$oldTag->id
					)
				);
				*/
				
				if (isset($oldTag->created_area_id)) $language_id=$oldTag->createdArea->getActualDefaultLanguage()->id;
				else $language_id=$this->currentArea->getActualDefaultLanguage()->id;
				$translation=TagTranslation::model()->findByAttributes(array(
					'language_id'=>$language_id,
					'tag_id'=>$targetTag->id,
				));
				if ($translation===null) {
					$translation=new TagTranslation();
					$translation->tag_id=$targetTag->id;
					$translation->language_id=$language_id;
					$translation->visible=true;
					$translation->value=$oldTag->name;
					$translation->save(false);
				}
				else {
					$newAlias=new TagTranslationAlias();
					$newAlias->value=$oldTag->name;
					$newAlias->tag_translation_id=$translation->id;
					$newAlias->visible=true;
					$newAlias->save(false);
				}
				if (!$oldTag->delete()) throw new CException("Couldn't delete old tag ".$oldTag->name); 
			
			}
			Tag::invalidateTagClouds();
			
			$this->redirect(array('tag/view', 'id'=>$targetTag->id));
		
		
		}
		else {
			$this->render('merge', array('tags'=>$tags));
		}
		
	
	
	} 
	
	
	
	
	
	
	
	/**
	 * Lists all models.
	 */
	public function actionIndex()
	{
		if (Yii::app()->request->isApiRequest) {
		
			if (isset($_GET['in'])) {
				$area=Area::get($_GET['in']);
				if (!$area) {
					throw new CHttpException(400, "Invalid area.");
				}
				$tags=Tag::model()->findMostUsedTags(array(
					'area'=>$area,
					'orderAlphabetically'=>false,
					'limit'=>Yii::app()->settings->tag_index_limit_app
				));
				
				echo Yii::app()->api->okResponse($tags);
				
			}
			else {
			
				$lat=null;
				$long=null;
				if (isset($_GET['lat']) && isset($_GET['long'])) {
					$lat=floatval($_GET['lat']);
					$long=floatval($_GET['long']);
				}
				else if (isset($_GET['latitude']) && isset($_GET['longitude'])) {
					$lat=floatval($_GET['latitude']);
					$long=floatval($_GET['longitude']);
				}
				if ($lat==0 || $long==0) {
					$lat=null;
					$long=null;
				}
			
				if ($lat==null || $long==null) {
					throw new CHttpException(400, "You must provide either 'lat' and 'long' or 'in' parameters.");
				}
		
				$dist_init=Yii::app()->settings->tags_explore_initial_radius;
				$dist_max=Yii::app()->settings->tags_explore_max_radius;
				$min_results=Yii::app()->settings->tags_explore_min_results;
		
				if (isset($_REQUEST['dist_init']) && ($dist_init_r=intval($_REQUEST['dist_init']))>0) $dist_init=$dist_init_r;
				if (isset($_REQUEST['dist_max']) && ($dist_max_r=intval($_REQUEST['dist_max']))>0) $dist_init=$dist_max_r;
				if (isset($_REQUEST['min_results']) && ($min_results_r=intval($_REQUEST['min_results']))>0) $min_results=$min_results_r;
			
						
				$criteria=Message::model()->createCommonCriteria(array(
					'showHidden'=>false, 
					'area'=>null, 
					'author'=>null,
					'isExpo'=>false,
					'isApi'=>true,
					'lat'=>$lat,
					'long'=>$long,
					'dist'=>$dist_init,
					'dist_init'=>$dist_init,
					'dist_max'=>$dist_max,
					'min_results'=>$min_results,
					'requester'=>Yii::app()->user->model,
					'testChannel'=>Yii::app()->request->testChannel
				)); 
			
				$messages=Message::model()->with(array(
					'tags',  
					'tags.translations', 
					'tags.summaries'=>array(
						'on'=>'summaries.area_id=-1 AND summaries.user_id=-1'
					)
				))->findAll($criteria);
			
				$tags=array();
				foreach ($messages as $message) {
					foreach ($message->tags as $tag) {
						if ($tag->visible && !isset($tags[$tag->id])) $tags[$tag->id]=$tag;
					}
				}
				$tags=array_values($tags);
				$sort=Yii::app()->settings->tag_index_default_order;
				if (isset($_REQUEST['sort'])) $sort=intval($_REQUEST['sort']);
				if ($sort) {
					$tags=Tag::sortAlphabetically($tags);
				}
				else {
					@usort($tags, function($tag1,$tag2){
						$p=array(0,0);
						foreach (array($tag1, $tag2) as $i=>$tag) {
							$summary=$tag->summaries;
							if ($summary) $summary=$summary[0];
							else continue;
							$p[$i]=$summary->authors_used;
						}
						if ($p[0]<$p[1]) return 1;
						else if ($p[0]==$p[1]) return 0; //-strcmp($tag1->asString, $tag2->asString);
						else return -1;
					});
				}
				echo Yii::app()->api->okResponse($tags);
			}
			
		}
		else {
			$this->layout='//layouts/public';
			$this->expoAllowScroll=true;
			
			$this->initBreadcrumbs();
			$this->breadcrumbs[0]=I::t('menu.tags');
			
		
		
			$order=Yii::app()->settings->tag_index_default_order;
			if (Yii::app()->request->isExpo) $order=0;
			if (isset($_GET['sort'])) {
				$order=(int)($_GET['sort']);
			}
		
			$this->render('index', array('order'=>$order));
		}
	}
	
	public function actionProposed() {
		//API ONLY
		$ret=Tag::getProposedTagsForApi(($user=Yii::app()->user->model)?$user->currentArea:null, $user);
		echo Yii::app()->api->okResponse($ret);
	}
	
	public function actionAutocomplete() {
		$language=I::currentLanguage();
		
		$command=Yii::app()->db->createCommand()
			->selectDistinct('IF (translation.value IS NOT NULL, translation.value, t.name)')
			->from(Tag::model()->tableName().' t');
		if ($this->currentArea) {
			$command->join(TagSummary::model()->tableName().' tag_summary', 'tag_summary.tag_id=t.id AND tag_summary.area_id=:areaId AND (tag_summary.times_used>0 OR tag_summary.featured>0)', array(':areaId'=>$this->currentArea->id));
		}
		
		$command->leftJoin(TagTranslation::model()->tableName().' translation', 'translation.tag_id=t.id AND translation.language_id=:langId', array(':langId'=>$language->id))
			->leftJoin(TagTranslationAlias::model()->tableName().' alias', 'alias.tag_translation_id=translation.id');
		if (isset($_GET['term'])) {
			$term=$_GET['term']."%";
			$command->where('t.visible>0 AND (t.name LIKE :term OR translation.value LIKE :term OR alias.value LIKE :term)', array(':term'=>$term)); 
		}
		else $command->where('t.visible>0');
		
		$results=$command->queryColumn();
		header('Content-Type: application/json');
		echo json_encode($results);
	}

	/**
	 * Manages all models.
	 */
	public function actionOldAdmin()
	{
		$model=new Tag('search');
		$model->unsetAttributes();  // clear any default values
		if(isset($_GET['Tag']))
			$model->attributes=$_GET['Tag'];

		$this->render('admin',array(
			'model'=>$model,
		));
	}
	
	public function actionEditTranslations() {
		$this->redirect(array('admin'));
	}
	
	public function actionAdmin()
	{
		$this->layout="//layouts/column1";
		$model=new Tag('search');
		$model->unsetAttributes();  // clear any default values
		
		/*
		if ($this->currentArea!=null) {
			$languages=$this->currentArea->languages;
		}
		else {
			$languages=Language::model()->findAll();
		}
		*/
		
		if (isset($_GET['Tag'])) { //this is used via ajax by gridview
			$model->attributes=$_GET['Tag'];
		}
		
		$this->render('admin',array(
			'model'=>$model,
			'showHiddenItems'=>true
		));
	}
	
	//TODO: ajax only
	public function actionUpdateTranslation($item_id,$language_id) {
		if (!isset($_POST['value'])) throw new CHttpException(400);
		else $value=$_POST['value'];
		
		$translation=TagTranslation::model()->findByAttributes(array('tag_id'=>$item_id,'language_id'=>$language_id));
		if ($translation===null) {
			$translation=new TagTranslation();
			$translation->tag_id=$item_id;
			$translation->language_id=$language_id;
		}
		$translation->value=$value;
		$ok=$translation->save();
		if ($ok) echo "OK";
		else echo "ERROR";
		Yii::app()->end();
	}





	/**
	 * Returns the data model based on the primary key given in the GET variable.
	 * If the data model is not found, an HTTP exception will be raised.
	 * @param integer the ID of the model to be loaded
	 */
	public function loadModel($id)
	{
		$model=Tag::model()->findByPk($id);
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
		if(isset($_POST['ajax']) && $_POST['ajax']==='tag-form')
		{
			echo CActiveForm::validate($model);
			Yii::app()->end();
		}
	}
}
