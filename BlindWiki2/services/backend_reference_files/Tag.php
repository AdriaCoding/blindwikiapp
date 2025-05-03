<?php

/**
 * This is the model class for table "tag".
 *
 * The followings are the available columns in table 'tag':
 * @property integer $id
 * @property string $name
 * @property integer $visible
 * @property string $created_date
 * @property integer $created_user_id
 * @property integer $created_area_id
 *
 * The followings are the available model relations:
 * @property User $createdUser
 * @property Area $createdArea
 * @property Area[] $areas
 * @property TagTranslation[] $tagTranslations
 * @property Message[] $messages
 */
class Tag extends TranslatableModel 
{
	/**
	 * Returns the static model of the specified AR class.
	 * @param string $className active record class name.
	 * @return Tag the static model class
	 */
	 
	private $_forcedTranslation; 
	
	
	private static $markerColors=array();
	private static $_translationCache=array();
	
	//public $occurrences;

	public static function model($className=__CLASS__)
	{
		return parent::model($className);
	}

	/**
	 * @return string the associated database table name
	 */
	public function tableName()
	{
		return 'tag';
	}

	/**
	 * @return array validation rules for model attributes.
	 */
	public function rules()
	{
		// NOTE: you should only define rules for those attributes that
		// will receive user inputs.
		return array(
			array('visible', 'required'),
			array('visible, created_user_id, created_area_id, marker_color', 'numerical', 'integerOnly'=>true),
			array('name', 'length', 'max'=>256),
			array('created_date', 'safe'),
			// The following rule is used by search().
			// Please remove those attributes that should not be searched.
			array('id, name, visible, created_date, created_user_id, created_area_id', 'safe', 'on'=>'search'),
		);
	}

	/**
	 * @return array relational rules.
	 */
	public function modelRelations()
	{
		return array(
			'createdUser' => array(self::BELONGS_TO, 'User', 'created_user_id'),
			'createdArea' => array(self::BELONGS_TO, 'Area', 'created_area_id'),
			'areas' => array(self::MANY_MANY, 'Area', 'tag_featured_area(tag_id, area_id)'),
			'translations' => array(self::HAS_MANY, 'TagTranslation', 'tag_id'),
			'messages' => array(self::MANY_MANY, 'Message', 'tag_x_message(tag_id, message_id)'),
			//'timesUsed' => array(self::STAT, 'Message', 'tag_x_message(tag_id, message_id)'),
			'summaries' => array(self::HAS_MANY, 'TagSummary', 'tag_id'),
		);
	}
	
	public function scopes() {
		return array(
			'onlyVisible'=>array(
				'condition'=>'visible=1',
			)
		);
	}
	
	public function withSortableTimesUsed($area=null) {
		$on='';
		if ($area!==null && $area!==false) {
			$on=' AND messages.area_id=:areaId';
			$this->dbCriteria->params[':areaId']=$area->id;
		}
		$this->dbCriteria->join='LEFT JOIN (tag_x_message AS xmessages LEFT JOIN message AS messages ON xmessages.message_id=messages.id ) ON xmessages.tag_id=t.id'.$on;
		$this->dbCriteria->select=array('*', 'COUNT(messages.id) AS timesUsed');
		$this->dbCriteria->group='t.id';
		return $this;
	}
	public function withIsFeatured($area) {
		if ($area===null || $area===false) $areaId=-1;
		else $areaId=$area->id;
		$this->dbCriteria->join='LEFT JOIN tag_featured_area AS featured ON featured.tag_id=t.id AND featured.area_id=:areaId';
		$this->dbCriteria->select=array('*', 'IF (featured.area_id IS NOT NULL, 1, 0) AS is_featured');
		$this->dbCriteria->params[':areaId']=$areaId;
		return $this;
	}

	/**
	 * @return array customized attribute labels (name=>label)
	 */
	public function attributeLabels()
	{
		return array(
			'id' => 'ID',
		);
	}
	
	
	
	public function beforeSave() {
		if (parent::beforeSave()) {
			if ($this->isNewRecord) {
				if (!isset($this->visible)) $this->visible=true;
				if (!isset($this->created_date)) $this->created_date=new CDbExpression('NOW()');
			}
			return true;
		}
		else return false;
	}
	
	/**
	 * Retrieves a list of models based on the current search/filter conditions.
	 * @return CActiveDataProvider the data provider that can return the models based on the search/filter conditions.
	 */
	public function search($includeHidden=false, $area=null)
	{
		// Warning: Please modify the following code to remove attributes that
		// should not be searched.
		
		$dp=parent::search();
		
		$criteria=$dp->criteria;
		
		//Yii::trace('Criteria scopes: '.print_r($criteria->scopes,true),'Tag.search');
		
		if ($criteria->with==null) $criteria->with=array();
		$orInCurrentArea='';
		//if (true) $criteria->with[]='timesUsed';
		if ($area==null || $area===false) $criteria->with['summaries']=array('on'=>'summaries.area_id=-1 AND summaries.user_id=-1');
		else {
			$criteria->with['summaries']=array('on'=>'summaries.area_id=:areaId AND summaries.user_id=-1', 'params'=>array(':areaId'=>$area->id));
			//$orInCurrentArea=' OR t.created_area_id=:areaId ';
		}
		//Tag::model()->withSortableTimesUsed($area)->applyScopes($criteria);
		//Tag::model()->withIsFeatured($area)->applyScopes($criteria);
		//Tag::model()->applyScopes($criteria);
		$dp->criteria=$criteria;
		
		
		//$criteria->order="IF (t.visible AND (COUNT(messages.id)>0 OR featured.area_id IS NOT NULL $orInCurrentArea), 0, 1), IF (featured.area_id IS NOT NULL, 0, 1)";
		$criteria->order="summaries.priority_order DESC, summaries.featured DESC";
		
		
		//$criteria->compare('id',$this->id);
		$criteria->compare('name',$this->name,true);
		//$criteria->compare('visible',$this->visible);
		$criteria->compare('created_date',$this->created_date,true);
		$criteria->compare('created_user_id',$this->created_user_id);
		$criteria->compare('created_area_id',$this->created_area_id);
		
		$dp->sort->attributes['timesUsed']=array(
			'asc'=>'summaries.times_used',
			'desc'=>'summaries.times_used DESC',
			'default'=>'desc',
			'label'=>'timesUsed'
		);
		$dp->sort->attributes[]='name';
		$dp->sort->defaultOrder=array('timesUsed'=>CSort::SORT_DESC);
		/*$dp->sort->attributes['name']=array(
			'asc'=>'IF (COUNT(messages.id)>0, 0, 1), t.name',
			'desc'=>'IF (COUNT(messages.id)>0, 0, 1), t.name DESC',
			'default'=>'asc',
			'label'=>'name'
		);*/
		
		$dp->pagination->pageSize=50;
		
		/*
		//Optimization (fucking MySQL count distinct bug)
		$othercriteria=clone $criteria;
		$othercriteria->with=array();
		$othercriteria->join='';
		$othercriteria->scopes=array();
		$othercriteria->select='*';
		Yii::trace('Setting data provider total item count', 'Tag-dp');
		$dp->totalItemCount=self::model()->count($othercriteria);
		*/
		return $dp;
		
		
		
		/*
		return new CActiveDataProvider(self::model()->scopeEdit(), array(
			'criteria'=>$criteria,
		));
		*/
	}
	
	public static function get($tag) {
		if ($tag instanceof self) return $tag;
		else if ($tag===null) return null;
		else if (is_numeric($tag)) return self::model()->findByPk($tag);
		else return self::model()->findByString($tag);
	}
	
	public function findByString($str,$languages=array()) {
		$byname=self::model()->findByAttributes(array('name'=>$str));
		if ($byname!=null) return $byname;
		
		$bytranslation=TagTranslation::model()->with('tag')->findByAttributes(array('value'=>$str));
		if ($bytranslation!=null) return $bytranslation->tag;
		
		$byalias=TagTranslationAlias::model()->with('tagTranslation','tagTranslation.tag')->findByAttributes(array('value'=>$str));
		if ($byalias!=null) return $byalias->tagTranslation->tag;
		
		return null;
	} 
	
	public function makeFeaturedIn($area) {
		if ($area instanceof Area) $areaId=$area->id;
		else $areaId=$area;
		
		$relmodel=TagFeaturedArea::model()->findByAttributes(array('tag_id'=>$this->id, 'area_id'=>$areaId));
		if ($relmodel!=null) {
			if (!$relmodel->visible) {
				$relmodel->visible=true;
				$relmodel->save(false);
			}
		}
		else {
			$relmodel=new TagFeaturedArea();
			$relmodel->area_id=$areaId;
			$relmodel->tag_id=$this->id;
			$relmodel->visible=true;
			if (!$relmodel->save(false)) throw new CException("Couldn't save tag_featured_area tag_id=".$this->id." area_id=".$areaId);
		}
	}
	
	// TODO: the $device parameter is obsolete; kept for compatibility with old calls
	public static function create ($name, $description, $user=null, $area=null, $device=null, $datetime=null) {
		Yii::log("Creating new tag $name");
		$tag=new Tag();
		$tag->name=$name;
		$tag->description=$description;
		if ($user!=null) $tag->created_user_id=$user->id;
		if ($area!=null) $tag->created_area_id=$area->id;
		if ($datetime!=null) $tag->created_date=$datetime;
		$tag->save(false);
		return $tag;
	}
	
	public static function getProposedTagsForApi($area=null, $user=null) {
		$proposedTags=Tag::getProposedTags($area, $user);
		$ret=array();
		foreach ($proposedTags as $tagGroup) {
			foreach ($tagGroup as $tag) {
				$ret[]=$tag->getApiProperties();
			}
		}
		return $ret;
	}
	
	public static function getProposedTags($area=null, $user=null) {
		$ret=array(
			'featured'=>array(),
			'own'=>array(),
			'popular'=>array()
		);
		$all=array();
		$ncollective=0;
		$order=Yii::app()->settings->tags_form_order;
		if ($user!=null) $prefLang=$user->preferredLanguage;
		else $prefLang=I::currentLanguage();
		for ($i=0;$i<count($order);$i++) {
			$item=$order[$i];
			switch ($item) {
				case 'own':
					$max=Yii::app()->settings->tags_form_maxOwn;
					if ($max>=0 && $user!=null) $ret[$item]=self::model()->findMostUsedTags(array(
						'user'=>$user, 
						'limit'=>$max, 
						'exclude'=>$all, 
						'includeHidden'=>Yii::app()->authManager->checkAccess('ViewHiddenTags',$user->id)
					));
					break;
				case 'popular':
					$max=Yii::app()->settings->tags_form_maxCollective-$ncollective;
					if ($area!=null && $max>=0) {
						$ret[$item]=$arr=self::model()->findMostPopularTags(array(
							'area'=>$area,
							'limit'=>$max,
							'exclude'=>$all,
							'includeHidden'=>($user!=null && Yii::app()->authManager->checkAccess('ViewHiddenTags', $user->id))
						));
						$ncollective+=count($arr);
					}
					break;
				case 'featured':
					$max=Yii::app()->settings->tags_form_maxCollective-$ncollective;
					if ($area!=null && ($max>=0 || Yii::app()->settings->tags_form_alwaysShowAllFeatured)) {
						$allm=array();
						foreach ($all as $m) $allm[]=$m->id;	
						$ret[$item]=$arr=$area->tags(array(
							'scopes'=>array('withIndexedTranslations', 'withAsString'),
							//'condition'=>($allm===array()?'1':'id NOT IN '.implode(',',array_map(function($m){return $m->id;}, $all)))
							'condition'=>($allm===array()?'1':'id NOT IN '.implode(',',$allm))
						));
						$ncollective+=count($arr);
					}
					break;
			}
			$all=array_merge($all,$ret[$item]);
		}
		return $ret;
	}
	
	/*
	public static function getProposedOwnTags($user, $max, $exclude=array(), $onlyIds=false) {
		
		if ($user==null || $max<=0) return array();
		if (!Yii::app()->user->checkAccess('ViewHiddenTags')) $andwhere=' AND tg.visible=1 ';
		else $andwhere='';
		if (count($exclude)>0) $andexclude=' AND t.tag_id NOT IN ('.implode(',',$exclude).') ';
		else $andexclude='';
		
		$tags=Yii::app()->db->createCommand()
			         ->select('t.tag_id, count(m.id) AS freq')
			         ->from(TagXMessage::model()->tableName().' t')
			         ->join(Tag::model()->tableName().' tg', 't.tag_id=tg.id')
			         ->join(Message::model()->tableName().' m','t.message_id=m.id')
			         ->where('m.author_user_id=:userId '.$andexclude.$andwhere,
			                 array(
			                 	':userId'=>$user->id
			                 )
			         )
			         ->group('t.tag_id')
			         ->order('freq DESC')
			         ->limit($max)
			         ->queryColumn();
		
		if (!$onlyIds) {
			$tags=Tag::model()->with(array('translations'))->findAllByPkAlphabeticallyOrdered($tags,$user==null?I::currentLanguage():$user->preferredLanguage);
		}
		//Yii::trace('Proposed own tags: '.print_r($tags,true));
		return $tags;
		   
	}
	
	public static function getProposedPopularTags($area, $max, $exclude=array(), $onlyIds=false) {
		
		if ($area==null || $max<=0) return array();
		if (!Yii::app()->user->checkAccess('ViewHiddenTags')) $andwhere=' AND tg.visible=1 AND u.visible=1';
		else $andwhere='';
		if (count($exclude)>0) $andexclude=' AND t.tag_id NOT IN ('.implode(',',$exclude).') ';
		else $andexclude='';
		
		$tags=Yii::app()->db->createCommand()
			         ->select('t.tag_id, COUNT(DISTINCT u.id) AS freq')
			         ->from(TagXMessage::model()->tableName().' t')
			         ->join(Tag::model()->tableName().' tg', 't.tag_id=tg.id')
			         ->join(Message::model()->tableName().' m','t.message_id=m.id')
			         ->join(User::model()->tableName().' u','m.author_user_id=u.id')
			         ->where('m.area_id=:areaId '.$andexclude.$andwhere,
			                 array(
			                 	':areaId'=>$area->id,
			                 )
			         )
			         ->group('t.tag_id')
			         ->order('freq DESC')
			         ->limit($max)
			         ->queryColumn();
		
		if (!$onlyIds) {
			$tags=Tag::model()->with(array('translations'))->findAllByPkAlphabeticallyOrdered($tags);
		}
		return $tags;
		   
	}
	
	public static function getProposedFeaturedTags($area, $max, $exclude=array(), $onlyIds=false) {
		$all=Yii::app()->settings->tags_form_alwaysShowAllFeatured;
		if ($area==null || ($max<=0 && !$all)) return array();
		if (!Yii::app()->user->checkAccess('ViewHiddenTags')) $andwhere=' AND tg.visible=1 ';
		else $andwhere='';
		if (count($exclude)>0) $andexclude=' AND t.tag_id NOT IN ('.implode(',',$exclude).') ';
		else $andexclude='';
		$dbcommand=Yii::app()->db->createCommand()
			         ->select('t.tag_id')
			         ->from(TagFeaturedArea::model()->tableName().' t')
			         ->join(Tag::model()->tableName().' tg', 't.tag_id=tg.id')
			         ->where('area_id=:areaId '.$andexclude.$andwhere,
			                 array(
			                 	':areaId'=>$area->id,
			                 )
			         );
		if (!$all) $dbcommand->limit($max);
		
		$tags=$dbcommand->queryColumn();
		
		if (!$onlyIds) {
			$tags=Tag::model()->with(array('translations'))->findAllByPkAlphabeticallyOrdered($tags);
		}
		return $tags;
		   
	}
	*/
	
	/*
	public function findAllByPkAlphabeticallyOrdered($ids,$prefLang=null) {
		Yii::trace('ids: '.implode(',',$ids),'Tag::findAllByPkAlphabeticallyOrdered');
		if ($prefLang==null) $prefLang=I::currentLanguage();
		if ($ids==null || $ids===array()) return array();
		$sql='SELECT tag.*, IF (tag_translation.value IS NOT NULL AND tag_translation.value <> \'\', tag_translation.value, tag.name) AS translation FROM tag LEFT JOIN tag_translation ON tag.id=tag_translation.tag_id AND tag_translation.language_id=:languageId WHERE tag.id IN ('.implode(',',$ids).') ORDER BY translation';
		$params=array(':languageId'=>$prefLang->id);
		//$model=self::model();
		//$model->dbCriteria=null;
		//Yii::trace('db criteria: '.$model->getDbCriteria()->with,'Tag::findAllByPkAlphabeticallyOrdered');
		$tags=$this->findAllBySql($sql,$params);
		Yii::trace('tags: '.count($tags),'Tag::findAllByPkAlphabeticallyOrdered');
		return $tags;
	}
	*/
	
	
	
	public function findMostUsedTags($params=array()) {
		// TODO: support for the testChannel parameter is not implemented yet. Tags used by test users are not displayed or counted even in test mode.
		//       Tag Summaries need to be modified before support for test channels can be implemented.
		$_params=array('area'=>null, 'user'=>null, 'limit'=>-1, 'popular'=>false, 'exclude'=>array(), 'includeHidden'=>false, 'orderAlphabetically'=>true, 'onlyFeatured'=>false, 'forceTranslation'=>false, 'skipcolors'=>false, 'testChannel'=>'');
		foreach($params as $k=>$v) $_params[$k]=$v;
		
		if (isset($_params['area'])) {
			if (!isset($_params['onlyFeatured'])) {
				$_params['onlyFeatured']=($_params['area']->hasFeaturedTags);
			}
		}
		else {
			$_params['onlyFeatured']=false;
		}
		
		if (isset($_params['user'])) $_params['popular']=false;
		
		if ($_params['popular']) $countColumn='authors_used';
		else $countColumn='times_used';
		$selectOccurrences="summaries.$countColumn AS occurrences";
		
		
		$summaries_with=array(
			'select'=>false,
			'joinType'=>'INNER JOIN',
			'on'=>(($_params['user']==null)?'summaries.user_id=-1':'summaries.user_id='.$_params['user']->id).
			      (($_params['area']==null)?
			         (($_params['user']==null)?' AND summaries.area_id=-1':'')
			         :
			         ' AND summaries.area_id='.$_params['area']->id).
			      ($_params['onlyFeatured']?' AND summaries.featured>0':'')
		);
		
		if ((!isset($_params['languages']) || $_params['languages']===array() || count($_params['languages'])==1) && !$_params['forceTranslation']) {
			$criteria=new CDbCriteria(array(
				'select'=>"t.*, $selectOccurrences",
				'with'=>array(
					'summaries'=>$summaries_with,
				),
				'order'=>'occurrences DESC',
				'together'=>true,
			));
			if ($_params['limit']>0) $criteria->limit=$_params['limit'];
			
			$criteria->addCondition('t.visible>0');
			
			if ($_params['exclude']!==null && $_params['exclude']!==array() && $_params['exclude']!=='') {
				$exclude=$_params['exclude'];
				if (is_array($exclude)) {
					if ($exclude[0] instanceof Tag) {
						$excludem=array();
				   		foreach ($exclude as $m) $excludem[]=$m->id;
						$exclude=$excludem;
					}
				}
				$criteria->addNotInCondition("t.id", $exclude);
			}
			$criteria->addCondition("summaries.$countColumn>0");
			
			$ctags=Tag::model()->findAll($criteria);
			$ids=array();
			foreach ($ctags as $ctag) $ids[]=$ctag->id;
			$flipped=array_flip($ids);
			$ids=implode(", ",$ids);
			if ($ids=='') $tags=array();
			else $tags=Tag::model()->withIndexedTranslations()->withAsString()->findAll("t.id IN ($ids)");
			
			if (!$_params['orderAlphabetically'] && $tags!=array()) {
				$sorter=new TagSorter($flipped);
	
				usort($tags, array($sorter, "fsort"));
			}
			
			
			$counts=array();
			foreach ($ctags as $ctag) {
				Yii::trace("*** Occurrences of tag ".$ctag->id." (".$ctag->name."): ".$ctag->getQueryResultData('occurrences'));
				$counts[$ctag->id]=$ctag->getQueryResultData('occurrences');
			}
			foreach ($tags as $tag) $tag->storeQueryResultData('occurrences', $counts[$tag->id]);
		
		}
		else {
			if (!isset($_params['languages']) || $_params['languages']===array()) $_params['languages']=array(I::currentLanguage());
			$_params['skipcolors']=true;
			
			$criteria=new CDbCriteria(array(
				'select'=>"t.*, $selectOccurrences",
				'with'=>array(
					'tag'=>array(
						'joinType'=>'INNER JOIN',
						'select'=>'*',
						'condition'=>'tag.visible>0',
					),
					'tag.summaries'=>$summaries_with,
				),
				'together'=>true,
				'order'=>'occurrences DESC',
			));
			$criteria->addCondition("summaries.$countColumn>0");
			if ($_params['limit']>0) $criteria->limit=$_params['limit'];
			$criteria->addCondition('t.visible>0');
			$criteria->addCondition("t.value IS NOT NULL AND t.value<>''");
			$langids=array();
			foreach ($_params['languages'] as $language) $langids[]=$language->id;
			$criteria->addInCondition('t.language_id', $langids);
			
			$translations_tmp=TagTranslation::model()->findAll($criteria);
								
			$already=array();
			$tids=array();
			$transbyid=array();
			foreach ($translations_tmp as $translation) {
				if (!isset($already[$translation->value])) {
					$already[$translation->value]=true;
					$tids[]=$translation->id;
					$transbyid[$translation->id]=$translation;
				}
			}
			
			$tids=implode(", ",$tids);
			if ($tids=='') $ordered_tids=array();
			else if ($_params['orderAlphabetically']) $ordered_tids=Yii::app()->db->createCommand(
				"SELECT id FROM tag_translation WHERE id IN ($tids) ORDER BY value"
			)->queryColumn();
			else $ordered_tids=$tids;
			
			$tags=array();
				
			$langsbyalphabet=Language::separateByAlphabet($_params['languages']);
			if (count($langsbyalphabet)<=1) {
				foreach ($ordered_tids as $tid) {
					$translation=$transbyid[$tid];
					$tag=clone $translation->tag;
					$tag->storeQueryResultData('occurrences', $translation->getQueryResultData('occurrences'));
					//Yii::trace("***Going to store forced translation '".$translation->value."' for tag ".$tag->id);
					$tag->forcedTranslation=$translation->value;
					$tags[]=$tag;
				}
			}
			else {
				$tagsbyalphabet=array();
				foreach ($ordered_tids as $tid) {
					$translation=$transbyid[$tid];
					$tag=clone $translation->tag;
					$tag->storeQueryResultData('occurrences', $translation->getQueryResultData('occurrences'));
					//Yii::trace("***Going to store forced translation '".$translation->value."' for tag ".$tag->id);
					$tag->forcedTranslation=$translation->value;
					$tlanguage=Language::getById($translation->language_id);
					if (!isset($tagsbyalphabet[$aid=$tlanguage->alphabet_id])) {
						$tagsbyalphabet[$aid]=array();
					}
					$tagsbyalphabet[$aid][]=$tag;
				}
				if (($nalphas=count($tagsbyalphabet))==0) $tags=array();
				else if ($nalphas==1) {
					$alphakeys=array_keys($tagsbyalphabet);
					$tags=$tagsbyalphabet[$alphakeys[0]];
				}
				else {
					$counts=array();
					$props=array();
					$ref_alpha=-1;
					$max_count=0;
					foreach ($tagsbyalphabet as $aid=>$atags) {
						$counts[$aid]=($acount=count($atags));
						if ($acount>$max_count) {
							$max_count=$acount;
							$ref_alpha=$aid;
						}
					}
					$debt=array();
					foreach($counts as $k=>$v) {
						$props[$k]=$v/$max_count;
						$debt[$k]=$props[$k];
					}
					$done=false;
					while (!$done) {
						$done=true;
						foreach ($debt as $dk=>$dv) {
							$dtags=&$tagsbyalphabet[$dk];
							while (count($dtags)>0 && $debt[$dk]>0) {
								$tag=array_shift($dtags);
								$tags[]=$tag;
								$debt[$dk]--;
								$done=false;
							}
							$debt[$dk]+=$props[$dk];
						}
						
					}
				}
			}
		}
		
		if (!$_params['skipcolors'] && ($_params['limit']>3 || $_params['limit'] <0)) self::assignMarkerColors($ctags);
		return $tags;
	}
	
	
	public function findMostPopularTags($params=array()) {
		$params['popular']=true;
		return $this->findMostUsedTags($params);
		
		
	}
	
	/*
	public static function addTagsCondition(&$criteria,$tags) {
		if ($tags==null || $tags===array() || $tags=='') return;
		if (is_array($tags)) {
			if ($tags[0] instanceof Tag) {
				//$tags=array_map(function($t){return $t->id;}, $tags);
				$tagsm=array();
				foreach ($tags as $m) $tagsm[]=$m->id;
				$tags=$tagsm;
			}
		}
		if (is_string($tags)) $tags=mb_explode(',',$tags);
		$criteria->with['tags']=array(
			'joinType'=>'INNER JOIN',
		);
		$criteria->addInCondition('t.id', $tags);
		$criteria->together=1;
	}
	*/
	
	public function getApiProperties() {
		return array(
			'id'=>$this->id,
			'name'=>$this->getAsString(),
			'asString'=>$this->getAsString(),
		);
	}
	
	public static function assignMarkerColors($tags,$onlyByAdmin=null) {
		if (self::$markerColors!==array()) return;
		Yii::trace("Assigning marker colors to ".count($tags)." tags");
		if ($onlyByAdmin===null) {
			if (($carea=Yii::app()->request->currentArea)!=null && $carea->hasFeaturedTags) $onlyByAdmin=true;
			else $onlyByAdmin=false; 
		}
		
		if (isset($_GET['ctags'])) $tags=explode(',', $_GET['ctags']);
		$used=array();
		$k=0;
		$i=1;
		if (count($tags)>0 && !($tags[0] instanceof Tag)) {
			$in=implode(",",$tags);
			//Yii::trace("..getting tags from ids: $in");
			$tagsm=Tag::model()->findAll("t.id IN ($in)");
			$tagso=array(); //because I need to preserve the order
			$tagsr=array();
			foreach ($tagsm as $tagm) $tagso[$tagm->id]=$tagm;
			foreach ($tags as $id) $tagsr[]=$tagso[$id];
			$tags=$tagsr;
		}
		//Yii::trace(print_r($tags,true));
		foreach ($tags as $tag) {
			//Yii::trace("Tag ".$tag->id.": ".print_r($tag,true));
			if ($tag->marker_color>0) {
				//Yii::trace("Assigning color ".$tag->marker_color." to tag ".$tag->name);
				self::$markerColors[$tag->id]=$tag->marker_color;
				$used[$tag->marker_color]=true;
			}
			//else Yii::trace("Tag ".$tag->name." has marker color zero=".$tag->marker_color);
		}
		if (!$onlyByAdmin) while ($i<Yii::app()->settings->map_nMarkerColors) {
			if ($k>=count($tags)) break;
			if (isset($used[$i])) {
				$i++;
				continue;
			}
			$tag=$tags[$k];
			$tagId=$tag->id;
			if ($tag->marker_color==0) {
				self::$markerColors[$tagId]=$i;
				$i++;
			}
			$k++;
			
		}
	}
	
	public static function sortAlphabetically($tags, $language=null) {
		if (count($tags)<2) return $tags;
		if (!$language) $language=I::currentLanguage();
		$language=Language::get($language);
		$tagsassoc=array();
		foreach ($tags as $tag) $tagsassoc[$tag->id]=$tag;
		$tagids=array_map(function($t){ return $t->id;}, $tags);
		$dbtags=Tag::model()->withIndexedTranslations()->withAsString()->findAll(array(
			'condition'=>'t.id IN('.implode(',', $tagids).')',
			'order'=>'as_string'
		));
		$ret=array();
		foreach($dbtags as $dbtag) {
			$ret[]=$tagsassoc[$dbtag->id];
		}
		return $ret;
	}
	
	public function getMarkerColor() {
		if (self::$markerColors===array()) self::assignMarkerColors(array());
		//Yii::trace('Getting marker color for tag '.$this->getAsString(), 'markercolor');
		if (isset(self::$markerColors[$this->id])) {
			//Yii::trace('Value found: returning '.self::$markerColors[$this->id], 'markercolor');
			return self::$markerColors[$this->id];
		}
		else {
			//Yii::trace('Marker color not found, returning 0', 'markercolor');
			return 0;
		}
	}
	
	//override
	public function getAsString($languages=array()) {
		if ($languages===null || $languages===array()) $languages=array(I::currentLanguage());
		if (!is_array($languages)) $languages=array($languages);
		if (!isset(self::$_translationCache[$this->id])) self::$_translationCache[$this->id]=array();
		if (!isset(self::$_translationCache[$this->id][$languages[0]->id])) {
			self::$_translationCache[$this->id][$languages[0]->id]=self::fixCase(parent::getAsString($languages,true));
		}
		return self::$_translationCache[$this->id][$languages[0]->id];
	}
	
	
	public static function fixCase($tagstring) {
		$tagstring=trim($tagstring);
		if (mb_strlen($tagstring,'UTF-8')>1) {
			$secondchar=mb_substr($tagstring,1,1,'UTF-8');
			if ($secondchar!=mb_strtoupper($secondchar,'UTF-8')) {
				$tagstring=mb_strtolower(mb_substr($tagstring,0,1,'UTF-8'),'UTF-8').mb_substr($tagstring,1,99999,'UTF-8');
			}
		}
		return $tagstring;
	}
	
	public static function getColorCachedTags() {
		return array_keys(self::$markerColors);
	}
	
	protected function afterSave() {
		Area::model()->invalidateAllCachedDates();
		$this->invalidateDependantPageCacheEntries();
		foreach($this->messages as $message) {
			$message->updateTagsFulltext();
		}
		parent::afterSave();
	}
	protected function afterDelete() {
		Area::model()->invalidateAllCachedDates();
		$this->invalidateDependantPageCacheEntries();
		parent::afterDelete();
	}
	protected function beforeDelete() {
		$this->visible=0;
		if ($this->save(false)) {
			foreach ($this->messages as $message) $message->updateTagsFulltext();
		}
		return parent::beforeDelete();
	}
	
	public function invalidateDependantPageCacheEntries() {
		Utils::invalidatePCacheDependency("cachecheck.pages.tag".$this->id);
	}
	
	public function onlyFeatured($area) {
		return $this->with(array('areas'=>array('joinType'=>'INNER JOIN', 'on'=>"areas.id=".$area->id)));
	}
	
	public static function invalidateTagClouds($params=array()) {
		if ($params==array()) $params=array('area'=>'all','language'=>'all');
		if (isset($params['area'])) {
			if($params['area']==='all') {
				foreach (Area::model()->findAll() as $area) self::invalidateTagClouds(array('area'=>$area)); 
			}
			else if ($params['area']==='global' || $params['area']===false) {
				$key="global";
			}
			else {
				self::invalidateTagClouds(array('area'=>'global'));
				if (($area=$params['area']) instanceof Area) $area=$area->id;
				$key="area$area";
			}
		}
		if (isset($params['language'])) {
			if ($params['language']==='all') {
				foreach (I::languages() as $language) self::invalidateTagClouds(array('language'=>$language));
			}
			else {
				if (($language=$params['language']) instanceof Language) $language=$language->id;
				$key="language$language";
			}
		}
		if (isset($key)) Utils::invalidatePCacheDependency("cachecheck.tagcloud.$key");
	}
	
	public function getForcedTranslation() {
		if (!isset($this->_forcedTranslation)) {
			throw new CException("No forced translation available for tag ".$this->id);
			return $this->getAsString();
		}
		else return $this->_forcedTranslation;
	}
	public function setForcedTranslation($str) {
		//if ($this->_forcedTranslation!=null) Yii::trace("WARNING: ***Changing forced translation value of tag ".$this->id." from ".$this->_forcedTranslation." to $str");
		$this->_forcedTranslation=$str;
	}
	
	
}


class TagSorter {
	public $flipped;
	function __construct($flipped) {
		$this->flipped=$flipped;
	}
	function fsort($tag1, $tag2) {
		if ($this->flipped[$tag1->id]<$this->flipped[$tag2->id]) return -1;
		else if ($this->flipped[$tag1->id]==$this->flipped[$tag2->id]) return 0;
		else return 1;
	}
}
