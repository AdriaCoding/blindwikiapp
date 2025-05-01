<?php

/**
 * This is the model class for table "message".
 *
 * The followings are the available columns in table 'message':
 * @property integer $id
 * @property string $text
 * @property string $date_time
 * @property integer $visible
 * @property string $longitude
 * @property string $latitude
 * @property string $timezone
 * @property integer $area_id
 * @property integer $author_user_id
 *
 * The followings are the available model relations:
 * @property Attachment[] $attachments
 * @property Comment[] $comments
 * @property ExternalPublication[] $externalPublications
 * @property User $authorUser
 * @property Area $area
 * @property Area[] $areas
 * @property Tag[] $tags
 * @property Vote[] $votes
 */
class Message extends ActiveRecord
{
	/**
	 * Returns the static model of the specified AR class.
	 * @param string $className active record class name.
	 * @return Message the static model class
	 */
	 
	private $_attachmentsByType;
	private $_tagstring=array();
	private $_mapInfo;
	 
	public static function model($className=__CLASS__)
	{
		return parent::model($className);
	}

	/**
	 * @return string the associated database table name
	 */
	public function tableName()
	{
		return 'message';
	}

	/**
	 * @return array validation rules for model attributes.
	 */
	public function rules()
	{
		// NOTE: you should only define rules for those attributes that
		// will receive user inputs.
		return array(
			array('longitude,latitude', 'numerical'),
			//array('longitude, latitude', 'length', 'max'=>11),
			array('text', 'safe'),
			array('address', 'safe'),
			array('device_string', 'length', 'max'=>20),
			array('show_location, text_visible', 'boolean'),
			// The following rule is used by search().
			// Please remove those attributes that should not be searched.
			array('id, text, date_time, visible, longitude, latitude, timezone, area_id, author_user_id', 'safe', 'on'=>'search'),
		);
	}

	/**
	 * @return array relational rules.
	 */
	public function relations()
	{
		// NOTE: you may need to adjust the relation name and the related
		// class name for the relations automatically generated below.
		return array(
			'attachments' => array(self::HAS_MANY, 'Attachment', 'message_id',
				'scopes'=>'orderByType',
			),
			'comments' => array(self::HAS_MANY, 'Comment', 'message_id'),
			'externalPublications' => array(self::HAS_MANY, 'ExternalPublication', 'message_id'),
			'authorUser' => array(self::BELONGS_TO, 'User', 'author_user_id'),
			'area' => array(self::BELONGS_TO, 'Area', 'area_id'),
			'areas' => array(self::MANY_MANY, 'Area', 'message_featured_area(message_id, area_id)'),
			'tags' => array(self::MANY_MANY, 'Tag', 'tag_x_message(message_id, tag_id)'),
			'votes' => array(self::HAS_MANY, 'Vote', 'message_id'),
		);
	}
	
	public function scopes() {
		return array(
			'onlyVisible'=>array(
				'condition'=>($this->tableAlias).'.visible=1',
			)
		);
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

	/**
	 * Retrieves a list of models based on the current search/filter conditions.
	 * @return CActiveDataProvider the data provider that can return the models based on the search/filter conditions.
	 */
	public function search()
	{
		// Warning: Please modify the following code to remove attributes that
		// should not be searched.

		$criteria=new CDbCriteria;

		$criteria->compare('id',$this->id);
		$criteria->compare('text',$this->text,true);
		$criteria->compare('date_time',$this->date_time,true);
		$criteria->compare('visible',$this->visible);
		$criteria->compare('longitude',$this->longitude,true);
		$criteria->compare('latitude',$this->latitude,true);
		$criteria->compare('timezone',$this->timezone,true);
		$criteria->compare('area_id',$this->area_id);
		$criteria->compare('author_user_id',$this->author_user_id);

		return new CActiveDataProvider($this, array(
			'criteria'=>$criteria,
		));
	}
	
	public function computeTimeZone($store=true) {
		if (($areaTimeZone=$this->area->timezone)
			!=null && 
			$areaTimeZone!='') 
				$timezone=$areaTimeZone;
		else $timezone=Yii::app()->db->createCommand('SELECT @@global.time_zone')->queryScalar();
		if ($timezone=='SYSTEM') $timezone=Yii::app()->db->createCommand('SELECT @@global.system_time_zone')->queryScalar();
		if ($store) $this->timezone=$timezone;
		return $timezone;
	}
	
	public function beforeSave() {
		if (parent::beforeSave()) {
			if ($this->isNewRecord) {
				if ($this->author_user_id==null) $this->author_user_id=Yii::app()->user->id;
				if ($this->area_id==null) $this->area_id=Yii::app()->request->currentArea->id;
				if (!isset($this->timezone)) $this->computeTimeZone();
				if (!isset($this->date_time)) $this->date_time=new CDbExpression('CONVERT_TZ(NOW(),@@global.time_zone, :timeZone)', array(
					':timeZone'=>$this->timezone
				));
				if (!isset($this->visible)) $this->visible=1;
				if (!isset($this->address)) $this->address="";
				if (!isset($this->show_location)) $this->show_location=1;
			}
			return true;
		}
		else {
			Yii::log('Message: beforeSave() returning false!','warning');
			return false;

		}
	}
	public function createAttachments($uploadedFiles, $uploadedImageId=null, $dataUris=array()) {
		$ok=true;
		for ($i=0;$i<count($uploadedFiles);$i++) {
			$uploadedfile=$uploadedFiles[$i];
			$attachment=$this->createAttachment($uploadedfile);
			if ($attachment===null || $attachment->hasErrors()) {
				$this->addError('attachments','Failed to attach file ('.$uploadedfile->name.', '.$uploadedfile->extensionName.', '.$uploadedfile->error);
				$ok=false;
			}
		}
		if (isset($uploadedImageId)) {
			$uploadedImage=ImageUploadForm::getFromSession($uploadedImageId);
			if ($uploadedImage==null) {
				$this->addError('attachments', 'Failed to get pre-uploaded image '.$uploadedImageId);
				$ok=false;
			}
			else {
				if (!isset($uploadedImage->filename)) {
					$this->addError('attachments', 'Failed to store pre-uploaded image '.$uploadedImageId);
					$ok=false;
				}
				else {
					$this->createAttachmentFromUploadedImage($uploadedImage->path);
				}
			}
		}
		foreach ($dataUris as $dataUri) {
			 $this->createAttachmentFromDataUri($dataUri);
		}
		/*
		$url=Yii::app()->createAbsoluteUrl('message/processAttachments',array('messageId'=>$this->id,'secret'=>Yii::app()->params['adminPassword']));
		Yii::log('Touching url to process attachments: '.$url);
		ERunActions::touchUrl($url);
		*/
		//Yii::app()->outputControl->onAfterOutput=array($this,'processAttachments');
		
		return $ok;
	}
	public function createAttachment($uploadedFile) {
		try {
			$attachment=new Attachment();
			$attachment->message_id=$this->id;
			$attachment->save(false);
			$attachment->uploadedFile=$uploadedFile;
			$attachment->save(false);
			return $attachment;
		}
		catch (Exception $e) {
			Attachment::saveFailedUpload($uploadedFile,$this);
			return null;
		}
	}
	public function createAttachmentFromUploadedImage($uploadedImageFile) {
		//try {
			$attachment=new Attachment();
			$attachment->message_id=$this->id;
			$attachment->save(false);
			$attachment->uploadedImageFile=$uploadedImageFile;
			$attachment->save(false);
			return $attachment;
		/*}
		catch (Exception $e) {
			Yii::log("Error creating attachment from pre-uploaded image file $uploadedImageFile\n".$e->getTraceAsString(), 'error');
			return null;
		}*/
	}
	public function createAttachmentFromDataUri($dataUri) {
		$attachment=new Attachment();
		$attachment->message_id=$this->id;
		$attachment->save(false);
		$attachment->dataUri=$dataUri;
		$attachment->save(false);
		return $attachment;
	}
	public function processAttachments($publishOnSocialNetworks=true) {
		Yii::log('Processing attachments for message '.$this->id);
		$attachments=$this->attachments;
		$geoinfo=null;
		for ($i=0;$i<count($attachments);$i++) {
			$attachment=$attachments[$i];
			Yii::log("Processing attachment $i (id ".$attachment->id.')');
           		$info=$attachment->process();
			//TODO: update message information from $info if necessary (e.g. latitude, longitude), what else?
			if ($geoinfo==null && $info!=null && isset($info['latitude']) && isset($info['longitude'])) {
				Yii::log('Attachment contains geo location information: latitude:'.$info['latitude'].' longitude: '.$info['longitude']);
				$geoinfo=$info;
			}
		}
		if ($geoinfo!=null && $this->latitude==null && $this->longitude==null) {
			Yii::log('Updating message geo location based on information extracted from attachment');
			$this->latitude=$geoinfo['latitude'];
			$this->longitude=$geoinfo['longitude'];
			//Yii::trace('done updating(not saving)');
			$this->deleteMaps();
			$this->address="";
		}
		if ($this->latitude!=null && $this->longitude!=null) {
			$this->retrieveMap();
			$this->retrieveAddress();
		}
		if (isset($info['transcription']) && trim($info['transcription'])!="" && ($this->text==null || $this->text=="")) {
			$this->text=$info['transcription'];
		}
		$this->pending=false;
		$this->visible=true;
		$this->save(false);
		if ($this->authorUser->visible) {
			Yii::app()->db->createCommand("
				UPDATE area SET message_count=message_count+1
				WHERE id IN(".(implode(',', $this->area->getParentIds(true))).")
			")->execute();
		}
		if ($publishOnSocialNetworks) $this->publishOnSocialNetworks();
	}
	
	public function publishOnSocialNetworks() {
		Yii::trace("Going to publish message ".$this->id." by ".$this->authorUser->adminName." in ".$this->area->adminName." on social networks", "social");
		if ($this->area->type!=Area::TYPE_GEO && $this->area->type!=Area::TYPE_EDITORIAL) {
			Yii::trace("Skipping because this is neither a GEO nor an EDITORIAL area", "social");
			return;
		}
		$user=$this->authorUser;
		if ($user->publish_facebook && $user->facebook_userid!=null && $user->facebook_userid!='') {
			Yii::trace("..going to publish message on ".$user->username."'s own Facebook wall", "social");
			$this->postOnFacebook($user->facebook_userid);
		}
		if ($user->publish_twitter && $user->twitter_userid!=null && $user->twitter_userid!='') {
			Yii::trace("..going to tweet on ".$user->username."'s own twitter account", "social");
			$this->postOnTwitter($user->twitter_userid);
		}
		
		if (($fbi=Yii::app()->params['facebook_userIdentity'])!=null) {
			Yii::trace("..going to publish message on Megafone Net's facebook wall", "social");
			$this->postOnFacebook($fbi['userId']);
		}
		
		if (($fbi=Yii::app()->settings->getSetting('facebook_userIdentity',$this->area,null,false))!=null) {
			Yii::trace("..going to publish message on ".$this->area->adminName." facebook wall", "social");
			$this->postOnFacebook($fbi['userId']);
		}
		else {
			Yii::trace("..no extra facebook user defined for ".$this->area->adminName, "social");
		}
		
		if (($sci=Yii::app()->settings->getSetting('soundcloud_global_userIdentity',$this->area))!=null && $this->visible && $this->area->visible && $user->visible) {
			Yii::trace("..going to post on SoundCloud (maybe)", "social");
			$this->postOnSoundCloud($sci['userId']);
		}
		
		if (($twi=Yii::app()->settings->getSetting('twitter_userIdentity',$this->area))!=null && $this->visible && $this->area->visible && $user->visible) {
			Yii::trace("..going to tweet on ".$this->area->adminName." twitter status", "social");
			$this->postOnTwitter($twi['userId']);
		}
		
		if (($gtwi=Yii::app()->settings->getSetting('twitter_global_userIdentity',$this->area))!=null && $this->visible && $this->area->visible && $user->visible) {
			Yii::trace("..going to tweet message on global twitter status", "social");
			$this->postOnTwitter($gtwi['userId']);
		}
		
		
		else {
			Yii::trace("..no extra twitter user defined for ".$this->area->adminName, "social");
		}
	}
	public function setTags($tags,$newtags=null) {
		if ($tags==null || (is_string($tags) && trim($tags)=='')) $tags=array();
		for ($i=0;$i<count($tags);$i++) {
			$this->addTag($tags[$i], true, false);
		}
		if ($newtags!=null) $this->setNewTags($newtags, false, false);
		$this->updateTagsFulltext();
	}
	public function setNewTags($newtags,$delete=false, $updateFulltext=true) {
		//if ($newtags===null || $newtags==='') return;
		mb_internal_encoding('UTF-8');
		mb_regex_encoding('UTF-8');
		if (is_string($newtags)) $newtags=mb_split('\s*,\s*',$newtags);
		else if (!is_array($newtags)) throw new CException("newtags is neither string nor array");
		if ($delete) $this->deleteTags(false);
		for ($i=0;$i<count($newtags);$i++) {
			$this->addTag($newtags[$i], true, false);
		}
		if ($updateFulltext) $this->updateTagsFulltext();
	}
	public function deleteTags($updateFulltext=true) {
		TagXMessage::model()->deleteAllByAttributes(array('message_id'=>$this->id));
		$this->area->invalidateCachedDates();
		if ($updateFulltext) $this->updateTagsFulltext();
	}
	public function addTag($tagid, $createIfNotExist=true, $updateFulltext=true) {
		if (is_string($tagid) && trim($tagid)=='') return;
		$tag=Tag::get($tagid);
		if ($tag==null) {
			if (is_string($tagid) && !is_numeric($tagid)) {
				if ($createIfNotExist) $tag=Tag::create($tagid, '', $this->authorUser, $this->area);
			}
			else {
				Yii::log("Cannot add tag $tagid. Invalid identifier", "error");
				return; 
			}
		}
		
		if ($tag!==null) {
			$rel=TagXMessage::model()->findByPk(array('tag_id'=>$tag->id,'message_id'=>$this->id));
			if ($rel==null) {
				Yii::trace('Adding tag '.$tag->name.' to message '.$this->id);
				$rel=new TagXMessage();
				$rel->message_id=$this->id;
				$rel->tag_id=$tag->id;
				$rel->save(false);
				
				if ($updateFulltext) $this->updateTagsFulltext();
			}
			else {
				Yii::trace('Message '.$this->id.' already has the tag '.$tag->name);
			}
		}
	}
	
	public function updateTagsFulltext() {
		$tags=$this->tags(array(
			'with'=>array('translations', 'translations.aliases')
		));
		$words=array();
		foreach ($tags as $tag) {
			if (!$tag->visible) continue;
			$words[mb_strtolower($tag->name,"UTF-8")]=true;
			foreach ($tag->translations as $translation) {
				if (!$translation->visible) continue;
				$words[mb_strtolower($translation->value,"UTF-8")]=true;
				foreach ($translation->aliases as $alias) {
					if (!$alias->visible) continue;
					$words[mb_strtolower($alias->value,"UTF-8")]=true;
				}
			}
		}
		$words=implode(" ", array_keys($words));
		$this->tags_fulltext=$words;
		$this->save();
	}

	public function getTagsAsStrings($prefLang=null, $includeHidden=false) {
		if ($prefLang===null) $prefLang='current';
		if ($prefLang==='author') $prefLang=$this->authorUser->preferredLanguage;
		else if ($prefLang==='current') $prefLang=Yii::app()->i18n->currentLanguage;
		else if (gettype($prefLang)=='integer') $prefLang=Language::model()->findByPk($prefLang);
		else if (!($prefLang instanceof Language)) throw new CException('Invalid language');
		if ($prefLang===null) throw new CException('Invalid language');
		
		$ret=array();
		for ($i=0;$i<count($this->tags);$i++) {
			if ($this->tags[$i]->visible) $ret[]=$this->tags[$i]->getAsString($prefLang);
		}
		
		return $ret;
	}
	
	public function printTags($language=null, $includeHidden=false) {
		Utils::beginProfile('message'.$this->id.'_printTags', 'application.Message.printTags');
		$langidx=($language==null?-1:(($language instanceof Language)?$language->id:$language));
		if (!isset($_tagstring[$langidx])) {
			$tags=$this->getTagsAsStrings($language, $includeHidden);
			if (count($tags)==0) $_tagstring[$langidx]='';
			else {
				$_tagstring[$langidx]='#'.implode(' #',$tags);
			}
		}
		Utils::endProfile('message'.$this->id.'_printTags', 'application.Message.printTags');
		return $_tagstring[$langidx];
	}
	
	public function getShortAddress() {
		if ($this->area->is_country || !$this->area->country_area_id) return $this->address;
		$areaname=array();
		$countryname=array();
		foreach (I::languages() as $language) {
			$areaname[]=preg_quote($this->area->getActualDisplayName($language), '/');
			$countryname[]=preg_quote($this->area->countryArea->getActualDisplayName($language), '/');
		}
		$areaname=implode('|', $areaname);
		$countryname=implode('|', $countryname);
		if (isset($_GET['debug7777'])) die("/,\s*\d+\s+($areaname),\s*($countryname)\s*$/iu");
		return preg_replace(
			"/,\s*\d+\s+($areaname),\s*($countryname)\s*$/iu",
			'',
			$this->address
		);
	}
	
	public function getMapInfo() {
		if (!isset($this->_mapInfo)) {
			if (!empty($this->maps)) {
				$this->_mapInfo=json_decode($this->maps, true);
			}
			else $this->_mapInfo=array();
		}
		return $this->_mapInfo;
	}

	public function hasMap($size=null, $retrieve=false) {
		if ($size==null) $size='';
		$had=isset($this->mapInfo[$size]);
		if (!$had && $retrieve && $this->hasLocation) {
			$this->retrieveMap(false,$size);
			return $this->hasMap($size, false);
		}
		else return $had;
		
	}
	public function hasCombinedMapImage() {
		return file_exists($this->getFullPathOfMap($this->getCombinedMapImageFileName()));
	}
	public function getFullPathOfMap($filename=null, $size=null) {
		if ($filename==null) $filename=$this->getMapFileName($size);
		return Yii::getPathOfAlias('webroot.maps').'/'.$filename;
	}
	
	/*
	public function getMapFileName($size=null) {
		if ($size==null) $size='';
		else $size="_$size";
		return 'message'.$this->id."_map$size.gif";
	}
	*/
	public function getMapFileName($size=null) {
		if ($size==null) $size='';
		return $this->mapInfo[$size]['filename'];
	}
	
	public function getCombinedMapImageFileName() {
		return 'message'.$this->id.'_map_combined.jpg';
	}
	public function deleteMaps() {
		if (!$this->hasMap()) return;
		$this->maps='';
		$this->save(false);
		$this->_mapInfo=null;
	}
	public function getMapUrl($absolute=false, $filename=null, $size=null) {
		if ($filename==null) $filename=$this->getMapFileName($size);
		return rtrim(Yii::app()->getBaseUrl($absolute),"/")."/maps/".$filename;
	}

	public function retrieveMap($simulate=false, $size=null, $deleteOtherSizes=false) {
		if ($size==null) $size='';
		$provider=Yii::app()->settings->getSetting("map_tile_provider_url", $this->area);
		$filename=$this->generateMapFileName($size);
		$filepath=$this->getFullPathOfMap($filename, $size);
		$ret=Yii::app()->staticMaps->grabMapImage($this->latitude,$this->longitude,$filepath,$size==null?$this->getDesiredMapSize():$size,Yii::app()->settings->getSetting('map_static_zoom', $this->area), $provider, $simulate, Yii::app()->settings->getSetting("map_static_marker", $this->area));
		if (!$simulate) {
			if (file_exists($filepath)) {
				$mapInfo=$this->mapInfo;
				if ($deleteOtherSizes) {
					$mapInfo=array();
				}
				$mapInfo[$size]=array('filename'=>$filename);
				$this->maps=json_encode($mapInfo);
				if ($size=='') $this->map_pending=0;
			}
			else {
				$this->map_pending=1;
			}
			$this->save(false);
			$this->_mapInfo=null;
		}
		if ($size=='') {
			$this->retrieveMap(false, Yii::app()->settings->expo_map_size);
		}
		return $ret;
	}
	
	public function generateMapFileName($size=null) {
		if ($size==null) $size='';
		if ($size!='') $size="_$size";
		return "message".$this->id."_map{$size}_".time()."_".uniqid().".gif";
	}

	public function retrieveAddress() {
		//TODO
	}
	
	public function getDesiredMapSize() {
		//Yii::trace('Get desired map size message '.$this->id);
		$videos=$this->attachments(array('scopes'=>array('onlyVisible', 'onlyVideo')));
		if (count($videos)>0) {
			//Yii::trace('Returning video size', 'rotate_map');
			return Yii::app()->settings->videoSizeDisplayed;
		}
		else {
			$images=$this->attachments(array('scopes'=>array('onlyImage', 'onlyVisible')));
			if (count($images)>0) $attachment=$images[0];
		}
		if (isset($attachment)) {
			//Yii::trace('Using size of image '.$attachment->local_filename, 'rotate_map');
			$size=$attachment->getDisplayImageSize();
			//Yii::trace('Size is '.print_r($size,true), 'rotate_map');
			if ($size==null || $size[0]==0 || $size[1]==0) return null;
			return $size;
		}
		else return Yii::app()->settings->getSetting('map_static_default_size', $this->area);
	}
	
	public function getAttachmentsByType($criteria=null) {
		if ($this->_attachmentsByType===null) {
			$this->_attachmentsByType=array();
			$this->_attachmentsByType[Attachment::TYPE_IMAGE]=array();
			$this->_attachmentsByType[Attachment::TYPE_AUDIO]=array();
			$this->_attachmentsByType[Attachment::TYPE_VIDEO]=array();
			$this->_attachmentsByType[Attachment::TYPE_UNKNOWN]=array();
			$attachments=($criteria===null?$this->attachments:$this->attachments($criteria));
			for ($i=0;$i<count($attachments);$i++) {
				$this->_attachmentsByType[$attachments[$i]->type][]=$attachments[$i];
			}
		}
		return $this->_attachmentsByType;
	}
	
	public function printDateTime() {
		//TODO
		return $this->date_time;
	}
	
	public function createCommonCriteria($options=array()) { 
		$criteria=new CDbCriteria();
		//$criteria->together=true;
		if (!isset($options['isApi'])) $options['isApi']=false;
		if (!isset($options['showHidden']) || !$options['showHidden']) {
			$criteria->condition='t.visible=1';
			if ($options['isApi']) {
				$criteria->condition.=' OR t.pending>0';
			}
			if (!isset($options['author'])) {
				$ortest='';
				if (isset($options['testChannel']) && $options['testChannel']) $ortest=" OR authorUser.testchannel='".$options['testChannel']."'";
				$criteria->with['authorUser']['condition']='authorUser.visible=1'.$ortest;
				$criteria->with['authorUser']['joinType']='STRAIGHT_JOIN';
			}
		}
		if (isset($options['author'])) {
			$criteria->addCondition('t.author_user_id=:userId');
			$criteria->params[':userId']=$options['author']->id;
		}
		if (isset($options['area']) && $options['area']!==false) {
			$criteria->addInCondition('t.area_id', $options['area']->getDescendantIds(true));
		}
		else {
			$criteria->with['area']['joinType']='INNER JOIN';
			$criteria->with['area']['condition']="area.visible > 0";
		}
		if (isset($options['tags'])) $this->addTagsCondition($criteria,$options['tags'], $options['isApi']);
		if ($options['isApi']
			&& isset($options['lat']) && ($lat=(float)($options['lat']))!=0
			&& isset($options['long']) && ($long=(float)($options['long']))!=0
		   ) {
			if (isset($options['dist']) && ($dist=(int)($options['dist']))>0) {
				$latlongrange=Utils::metersToLatLongRange($dist, $lat,$long);
				$latdist=$latlongrange[0];
				$longdist=$latlongrange[1];
				$minlat=$lat-$latdist/2;
				$maxlat=$lat+$latdist/2;
				$minlong=$long-$longdist/2;
				$maxlong=$long+$longdist/2;
				$criteria->addCondition("t.latitude IS NOT NULL && t.longitude IS NOT NULL");
				$criteria->addCondition("t.latitude>$minlat && t.latitude<$maxlat");
				$criteria->addCondition("t.longitude>$minlong && t.longitude<$maxlong");
				
				if (isset($options['dist_init']) && isset($options['dist_max']) && isset($options['min_results']) && $options['min_results']>0) 
				{
					$c_criteria = clone $criteria;
					$found=self::model()->count($c_criteria);
					if ($found<$options['min_results'] && $options['dist']<$options['dist_max']) {
						$options['dist']=min(2*$options['dist'], $options['dist_max']);
						$criteria=$this->createCommonCriteria($options);
					}
				}
				
			}
			$criteria->order="(t.latitude-$lat)*(t.latitude-$lat)+(t.longitude-$long)*(t.longitude-$long)";
			//$criteria->order="t.td DESC";
	
		}
		else {
			$criteria->order='t.date_time DESC';
		}
		
		return $criteria;
	}
	
	public function addTagsCondition(&$criteria, $tags, $any=false) {
		if ($tags===array() || $tags===null || $tags==='') return;
		if (is_string($tags)) {
			$tags=explode(',',$tags);
		}
		if ($tags[0] instanceof Tag) {
			$tagsm=array();
			foreach($tags as $tag) $tagsm[]=$tag->id;
			$tags=$tagsm;
		}
		$n=0;
		foreach ($criteria->params as $k=>$v) {
			if (strpos($k,':tagId')===0) {
				$n=max($n,substr($k,6));
			}
		}
		
		$newcriteria=new CDbCriteria(array(
			'join'=>'',
			'condition'=>$any?'(1=0)':'(1=1)',
		));
				
		for ($i=0; $i<count($tags); $i++) {
			$tagId=$tags[$i];
			$j=$n+1+$i;
			if ($i==0 || !$any) {
				$k=$j;
				$newcriteria->join.=" ".($any?'LEFT':'INNER')." JOIN tag_x_message as tgm$k ON tgm$k.message_id=".$this->getTableAlias().".id";
			}
			$newcriteria->addCondition("tgm$k.tag_id=:tagId$j", $any?'OR':'AND');
			$newcriteria->params[":tagId$j"]=$tagId;
			
		}
		
		$criteria->mergeWith($newcriteria);
		
	}
	
	/*
	public function create_CommonFindQuery($showHidden=false, $area=null, $user=null, $tags=array()) {
		$query=array();
		$query['select']='t.*';
		//$command->distinct=true;
		$query['from']=$this->tableName().' t';
		$query['conditions']=array('AND');
		$query['params']=array();
		$query['join']=array();
		$query['join'][]=array(Area::model()->tableName().' area', 'area.id=t.area_id');
		$query['join'][]=array(User::model()->tableName().' author', 'author.id=t.author_user_id');
		
		if (!$showHidden) {
			$query['conditions'][]='t.visible=1';
			$query['conditions'][]='author.visible=1';
		}
		if ($area!=null) {
			$query['conditions'][]='t.area_id=:areaId';
			$query['params'][':areaId']=$area->id;
		}
		if ($user!=null) {
			$query['conditions'][]='t.author_user_id=:userId';
			$query['params'][':userId']=$user->id;
		}
		
		if ($tags==null) $tags=array();
		if (is_string($tags)) $tags=explode(',',$tags);
		for ($i=0;$i<count($tags);$i++) {
			$tagId=$tags[$i];
			$query['join'][]=array("tag_x_message tg$i", "t.id=tg$i.message_id");
			$query['conditions'][]="tg$i.tag_id=:tagId$i";
			$query['params'][":tagId$i"]=$tagId;
		}
		$query['order']='t.date_time DESC';
		
		return $query;
	} 
	*/
	
	public function getDates($criteria, $showHiddenMessages=false) {
		
		$cr=clone $criteria;
		
		$this->applyScopes($cr);
		$cr->select='DATE(t.date_time) AS date';
		$cr->distinct=true;
		
		// This is a bad hack but Yii sucks in that it doesn't provide any way to build a command from a criteria with "with"s
		//   so that we can do a queryColumn() with it. So our only option is to do it ourselves, though this won't work for any arbitrary criteria
		foreach ((array)$cr->with as $relname=>$with) {
			if (is_string($relname) && is_array($with)) {
				if (isset($with['joinType'])) {
					switch($relname) {
						case 'authorUser': $cr->join.=' '.$with['joinType'].' user authorUser ON authorUser.id=author_user_id'; break;
						case 'area': $cr->join.=' '.$with['joinType'].' area area ON area.id=area_id'; break;
						default: continue 2;
					}
					;
					$cr->addCondition($with['condition']);
				}
			}
		}
		
		
		$command=$this->getCommandBuilder()->createFindCommand($this->getTableSchema(),$cr);
		
		
		return $command->queryColumn();
		
		/*$command=DbHelper::createDbCommand($query);
		$command->selectDistinct('DATE(t.date_time)');
		return $command->queryColumn();*/
	}
	
	public function getLatestDate($criteria) {
		
		$cr=clone $criteria;
		$cr->limit=1;
		$date=$this->getDates($cr);
		if (count($date)==0) return false;
		else return $date[0];
	}
	
	public function getTagString($language=null, $replaceSpaceWith=false) {
		if ($language==null) $language=I::defaultLanguage();
		$tags=$this->tags(array('scopes'=>array('onlyVisible')));
					
		$tagstrings=array();
		foreach ($tags as $tag) {
			$t=$tag->getAsString($language);
			if ($replaceSpaceWith!==false) $t=mb_ereg_replace(" ",$replaceSpaceWith,$t);
			$tagstrings[]=$t;
		}
		$tagstring=implode(" #",$tagstrings);
		if ($tagstring!="") $tagstring="#".$tagstring;
		
		return $tagstring;
	}
	
	public function getUrl($absolute=true) {
		Utils::beginProfile($token="message".$this->id.".getUrl","application.Message.getUrl");
		$r=($absolute?'http://'.Yii::app()->settings->domain:'').(Yii::app()->createUrl('message/view',array('id'=>$this->id, 'in'=>false)));
		Utils::endProfile($token,"application.Message.getUrl");
		return $r;
	}
	
	public function getRealUrl() {
		$area=$this->area;
		$date=date('Y-m-d', strtotime($this->date_time));
		return array('message/index', 'in'=>$area->id, 'date'=>$date, '#'=>'message'.$this->id);
	}
	
	public function postOnTwitter ($twitter_user_id) {
		try {
			Yii::log("Publishing message ".$this->id." on Twitter user $twitter_user_id's status", "info", "social");
			$longurl=$this->getUrl();
			//$url=Yii::app()->urlShortener->shorten($longurl);
			$url=$longurl;
			
			$tagstring=$this->getTagString($this->authorUser->preferredLanguage, "_");
			$authorToken=Utils::decodeNumericEntities($this->authorUser->getActualDisplayName().":");
			$textToken=''; //Utils::decodeNumericEntities($this->text);
			$tagsToken=Utils::decodeNumericEntities(" $tagstring");
			$urlToken=" $url";
			
			$soundCloudPublication=ExternalPublication::model()->findByAttributes(array(
				'message_id'=>$this->id,
				'type'=>AccessToken::APPLICATION_SOUNDCLOUD
			));
			$soundCloudUrlToken="";
			$maxlen=116-mb_strlen($authorToken,'UTF-8');
			if ($soundCloudPublication) {
				$maxlen-=24;
				$soundCloudUrlToken=" ".$soundCloudPublication->url;
			}
						
			if (mb_strlen($tagsToken,'UTF-8')>$maxlen) {
				$tags=mb_split(' #',$tagsToken);
				for ($i=count($tags)-1; $i>0 && mb_strlen($tagsToken)>$maxlen; $i--) {
					$tagsToken=implode(" #", array_slice($tags,0,$i));
				}
			}
			if ($maxlen-mb_strlen($tagsToken)<0) $tagsToken='';
			$maxlen=$maxlen-mb_strlen($tagsToken);
			if ($maxlen<3) $textToken='';
			else if (mb_strlen($textToken)>$maxlen-3) $textToken=mb_substr($textToken,0,$maxlen-3)."...";			
			
			$messagetext=$authorToken.$textToken.$tagsToken.$soundCloudUrlToken.$urlToken;
			
			$params=array('status'=>$messagetext);
			
			$response=Yii::app()->twitter->post($twitter_user_id,"statuses/update", $params);
			Yii::trace('Response from Twitter: '.print_r($response,true), "social");
			
		} catch (Exception $e) {
			Yii::log("Could not post message ".$this->id." on twitter ".$e->getMessage()."\n".$e->getTraceAsString(), 'warning');
		}
	}
	
	public function postOnSoundCloud ($sc_user_id) { 
		try {
			$audioAttachments=$this->attachmentsByType[Attachment::TYPE_AUDIO];
			if (count($audioAttachments)==0) {
				Yii::trace("Skipping message publication on SoundCloud because message has no audio", "social");
				return;
			}
			$audioAttachment=$audioAttachments[0];
			if (!$audioAttachment->visible) {
				Yii::trace("Skipping message publication on SoundCloud because message audio isn't visible", "social");
				return;
			}
			
			
			Yii::log("Publishing message ".$this->id." on SoundCloud user $sc_user_id's account", "info", "social");
			$url=$this->getUrl();
			
			$tagstring=$this->getTagString($this->authorUser->preferredLanguage, "_");
			$authorToken=Utils::decodeNumericEntities($this->authorUser->getActualDisplayName().": ");
			$textToken=''; //Utils::decodeNumericEntities($this->text);
			$tagsToken=Utils::decodeNumericEntities(" ".$tagstring);
			$urlToken=" ".$url;
			
			/*
			$maxlen=116-mb_strlen($authorToken,'UTF-8');
			if (mb_strlen($tagsToken,'UTF-8')>$maxlen) {
				$tags=mb_split(' #',$tagsToken);
				for ($i=count($tags)-1; $i>0 && mb_strlen($tagsToken)>$maxlen; $i--) {
					$tagsToken=implode(" #", array_slice($tags,0,$i));
				}
			}
			if ($maxlen-mb_strlen($tagsToken)<0) $tagsToken='';
			$maxlen=$maxlen-mb_strlen($tagsToken);
			if ($maxlen<3) $textToken='';
			else if (mb_strlen($textToken)>$maxlen-3) $textToken=mb_substr($textToken,0,$maxlen-3)."...";			
			*/
			
			$messagetext=$authorToken.$textToken.$tagsToken.$urlToken;
			
			$params=array(
			    'track[title]' => Utils::decodeNumericEntities($this->authorUser->getActualDisplayName()." @ ".$this->area->getActualDisplayName().", ".$this->date_time),
			    'track[asset_data]' => '@'.(Attachment::getFullPathOfFile($audioAttachment->local_filename)),
			    'track[description]' => $messagetext,
			);
			
			if ($this->hasMap()) {
				$params['track[artwork_data]']='@'.(Message::getFullPathOfMap($this->getMapFileName()));
			}
			
			$response=Yii::app()->soundCloud->post($sc_user_id,"tracks", $params);
			Yii::trace('Response from SoundCloud: '.print_r($response,true), "social");
			$uri=$response->permalink_url;
			$ep=new ExternalPublication();
			$ep->type=AccessToken::APPLICATION_SOUNDCLOUD;
			$ep->externalid=$response->id;
			$ep->message_id=$this->id;
			$ep->attachment_id=$audioAttachment->id;
			$ep->url=$uri;
			if (!$ep->save(false)) {
				Yii::log('Error saving ExternalPublication object', 'error', "social");
			}
			
		} catch (Exception $e) {
			$errorMessage="Could not post message ".$this->id." on SoundCloud: ".$e->getMessage()."\n";
			if (is_a($e, "Services_Soundcloud_Invalid_Http_Response_Code_Exception")) {
				$errorMessage.="Response body: \n".$e->getHttpBody()."\n";
			}
			
			Yii::log($errorMessage."\n".$e->getTraceAsString(), 'error');
		}
	}
	
	
	
	public function postOnFacebook($facebook_user_id) {
		try {
			Yii::log("Publishing message ".$this->id." on Facebook user $facebook_user_id's wall","info", "social");
			$longurl=$this->getUrl();
			$url=Yii::app()->urlShortener->shorten($longurl);
			
			$videoAttachments=$this->attachments(array(
				'scopes'=>array('onlyVisible', 'onlyVideo'),
			));
			
			
			$tagstring=$this->getTagString($this->authorUser->preferredLanguage, "_");
			$messagetext=Utils::decodeNumericEntities($this->authorUser->getActualDisplayName().": ".$this->text)." ".Utils::decodeNumericEntities($tagstring)." ".$url;
			
			$params=array(
				'message'=>$messagetext,
			);
			if (!$this->visible || !$this->authorUser->visible || !$this->area->visible) {
				$params['privacy']=Yii::app()->settings->facebook_hiddenContentPrivacy;
			}
					
			
			if (count($videoAttachments)>0) {
				Yii::trace("Message has a video. Will try to post the video to facebook", "social");
				$attachment=$videoAttachments[0];
				$vparams=array_slice($params,0);
				
				if (($videourl=$attachment->external_url)!=null && $videourl!='') {
					$vparams['link']=str_replace("embed/","watch?v=",$videourl);
					$vparams['source']=str_replace("embed/","v/",$videourl);
					$vparams['picture']=str_replace("www.youtube.com/embed/","i2.ytimg.com/vi/",$videourl)."/default.jpg";
				}
				else {
					//$params['source']="@".Attachment::getFullPathOfFile($attachment->local_filename);
				}
				if (isset($vparams['link'])) {
					Yii::trace('Posting video to Facebook');
					
					$response=Yii::app()->facebook->post($facebook_user_id,"/me/feed", $vparams);
					Yii::trace('Response from Facebook: '.print_r($response,true), "social");
					//print_r($response);
					
					//TODO: ExternalPublication
					
					return;
				}
				else {
					Yii::log("Video won't be posted on Facebook because it doesn't have an external url","warning","social");
				}
			}
			
			Yii::trace("Message doesn't have video. Looking for images", "social");
			$imageAttachments=$this->attachments(array(
				'scopes'=>array('onlyVisible', 'onlyImage')
			));
			if (count($imageAttachments)>0) {
				Yii::trace("Message has at least an image", "social");
				$attachment=$imageAttachments[0];
				if ($this->hasMap()) {
					Yii::trace("Message has map. Will try to post the combined image map+foto", "social");
					if (!$this->hasCombinedMapImage()) $this->createCombinedMapImage($attachment);
					$fn=$this->getCombinedMapImageFileName();
					$imagepath=$this->getFullPathOfMap($fn);
					$imageurl=$this->getMapUrl(true,$fn);
				}
				else {
					Yii::trace("Message doesn't have a map, so will post only the image", "social");
					$imagepath=Attachment::getFullPathOfFile($attachment->local_filename);
					$imageurl=$attachment->getLocalFileUrl(true);
				}
			}
			else {
				if ($this->hasMap()) {
					Yii::trace("Message doesn't have any image but it has a map, so will post the map to facebook", "social");
					$imagepath=$this->getFullPathOfMap();
					$imageurl=$this->getMapUrl(true);
				}
				else {
					Yii::trace("Message doesn't have any foto nor map. Won't post to Facebook", "social");
				}
			}
			
			if (isset($imagepath)) {
				
				Yii::trace("Uploading the image to Facebook album", "social");
				$iparams=array_slice($params,0);
				$iparams['source']="@".$imagepath;
				
				$response=Yii::app()->facebook->post($facebook_user_id,'/me/photos', $iparams,true);
				Yii::trace('Response from Facebook: '.print_r($response,true), "social");
				if (true) { //if (isset($response['id'])) {
					Yii::trace("Posting the image on facebook wall", "social");
					$fparams=array_slice($params,0);
					$fparams["picture"] =$imageurl;
					$fparams["link"]=$longurl;
					Yii::trace( "Posting to facebook feed with picture: $imageurl");
					
					$response2=Yii::app()->facebook->post($facebook_user_id, "/me/feed", $fparams,false);
					Yii::trace('Response from Facebook: '.print_r($response2,true), "social");
				}
				//print_r($response);
		
		
			}
			
		} catch (Exception $e) {
			Yii::log("Could not post message ".$this->id." by ".$this->authorUser->adminName." on Facebook: ".$e->getMessage()."\n".$e->getTraceAsString(), 'warning');
		}
	 
	}
	
	
	
	public function createCombinedMapImage($attachment=null) {
		if ($attachment==null) {
			$imageAttachments=$this->attachments(array(
				'scopes'=>array('onlyVisible', 'onlyImage'),
			));
			if (count($imageAttachments)>0) {
				$attachment=$imageAttachments[0];
			}
			else {
				Yii::log('Cannot create combined map image. No image attachment found for message '.$this->id.' by '.$this->authorUser->adminName,'error');
			}
		}
		if ($attachment!=null) {
			$imagepath=Attachment::getFullPathOfFile($attachment->local_filename);
			$mapimagepath=$this->getFullPathOfMap();
			$imagepath=realpath($imagepath);
			$mapimagepath=realpath($mapimagepath);
			$photoimage=imagecreatefromjpeg($imagepath);
			$mapimage=imagecreatefromgif($mapimagepath);
			$photosize=getimagesize($imagepath);
			$mapsize=getimagesize($mapimagepath);
			$finalheight=min($photosize[1],$mapsize[1]);
			$finalphotowidth=$photosize[0]*$finalheight/$photosize[1];
			$finalmapwidth=$mapsize[0]*$finalheight/$mapsize[1];
			$newimage=imagecreatetruecolor($finalphotowidth+$finalmapwidth,$finalheight);
			imagecopyresized($newimage,$photoimage,0,0,0,0,$finalphotowidth,$finalheight,$photosize[0],$photosize[1]);
			imagecopyresized($newimage,$mapimage,$finalphotowidth,0,0,0,$finalmapwidth,$finalheight,$mapsize[0],$mapsize[1]);
			$newimagepath=$this->getFullPathOfMap($this->getCombinedMapImageFileName());
			imagejpeg($newimage,$newimagepath);
		}
	}
	
	public function getMarkerColor($getTagId=true) { // NOTE: actually returns the id of the first tag
		//Yii::trace('Getting marker color for message '.$this->id, 'markercolor');
		$tags=$this->tags;
		//Yii::trace(' Found '.count($tags).' tags');
		if (count($tags)==0) return -1;
		else if ($getTagId) return $tags[0]->id; // getMarkerColor();
		else return $tags[0]->markerColor;
		return 0;
	}
	
	public function getHasLocation() {
		return $this->latitude!=null && $this->latitude!=0 && $this->longitude!=null && $this->longitude!=0;
	}
	
	public function move($toArea) { // DEPRECATED!!
		$this->invalidateAreaCachedDates();
		$this->invalidateAreaCachedBounds();
		if ($this->area->type==Area::TYPE_GEO) $this->area->invalidateCachedAuthorUsers();
		$this->area->invalidateCachedHasMessages();
		$this->invalidateDependantPageCacheEntries();
		Tag::invalidateTagClouds(array('area'=>$this->area));
		
		if ($this->visible) {
			$this->updateTagSummaries('delete');
		}
		if ($toArea instanceof Area) $toArea=$toArea->id;
		$this->area_id=$toArea;
		if (!$this->save(false)) {
			throw new CException("Couldn't save message ".$this->id);
		}
		$this->updateTagSummaries('add');
		foreach ($this->attachments as $attachment) {
			$attachment->updateFileName();
		}
	}
	
	public function isDuplicate() {
		$messages=Message::model()->findAll('date_time > (:time - INTERVAL 3 MINUTE) AND date_time<=:time AND id<:id', array(
			':time'=>$this->date_time,
			':id'=>$this->id
		));
		foreach ($messages as $message) {
			if ($this->isDuplicateOf($message)) return $message->id;
		}
		return false;
	}
	
	public function isDuplicateOf($message) {
		$this_tags=array_map(function($t){ return $t->id;}, $this->tags);
		sort($this_tags, SORT_NUMERIC);
		
		$other_tags=array_map(function($t){ return $t->id;}, $message->tags);
		sort($other_tags, SORT_NUMERIC);
		
		$this_tags=implode(",", $this_tags);
		$other_tags=implode(",", $other_tags);
		
		if ($this_tags!=$other_tags) return false;
		
		$this_attachment=$this->attachments;
		$other_attachment=$message->attachments;
		if (count($this_attachment)==0 || count($other_attachment)==0) return false;
		$this_attachment=$this_attachment[0];
		$other_attachment=$other_attachment[0];
		
		$this_filepath=Attachment::getFullPathOfFile($this_attachment->local_filename);
		if (!file_exists($this_filepath)) return false;
		@$filesize=filesize($this_filepath);
		if (!$filesize) return false;
		$pos=floor($filesize/2);
		@$this_file=fopen($this_filepath,'r');
		if (!$this_file) return false;
		@$s=fseek($this_file, $pos);
		if ($s!==0) return false;
		$nbytes=min(1024, $filesize-$pos);
		$bytes='';
		
		foreach (array($other_attachment->local_filename, $other_attachment->local_original_filename) as $other_filename) {
			if (empty($other_filename)) continue;
			$other_filepath=Attachment::getFullPathOfFile($other_filename);
			if (!file_exists($other_filepath)) continue;
			if (md5_file($this_filepath)===md5_file($other_filepath) && $filesize===filesize($other_filepath)) {
				if ($bytes==='') {
					@$bytes=fread($this_file, $nbytes);
					if ($bytes===false) return false;
				}
				@$other_file=fopen($other_filepath,'r');
				if (!$other_file) continue;
				@$s=fseek($other_file, $pos);
				if ($s!==0) continue;
				@$other_bytes=fread($other_file, $nbytes);
				if ($other_bytes===false) continue;
				if ($bytes===$other_bytes) return true;
			}
			
		}
		return false;
		
	}
	
	protected function afterSave() {
		$this->invalidateAreaCachedDates();
		$this->invalidateAreaCachedBounds();
		if ($this->area->type==Area::TYPE_GEO) $this->area->invalidateCachedAuthorUsers();
		$this->area->invalidateCachedHasMessages();
		$this->invalidateDependantPageCacheEntries();
		Tag::invalidateTagClouds(array('area'=>$this->area));
		parent::afterSave();
	}
	protected function afterDelete() {
		// TODO: we never actually delete messages, so this is completely untested
		if ($this->visible && $this->authorUser->visible) {
			// TODO: update tag summaries
			Yii::app()->db->createCommand("
				UPDATE area SET message_count=IF(message_count>0,message_count-1,0)
				WHERE id IN(".(implode(',',$this->area->getParentIds(true))).")
			")->execute();
		}
		$this->invalidateAreaCachedDates();
		if ($this->area->type==Area::TYPE_GEO) $this->area->invalidateCachedAuthorUsers();
		$this->invalidateDependantPageCacheEntries();
		Tag::invalidateTagClouds(array('area'=>$this->area));
		parent::afterDelete();
	}
	public function invalidateAreaCachedDates() {
		$area=$this->getRelated('area',true);
		$area->invalidateCachedDates(false);
		if ($area->type==Area::TYPE_GEO && ($editorial=$area->editorial)!==null) {
			$editorial->invalidateCachedDates(false);
		}
		Area::invalidateGlobalCachedDates();
		if (($thisyear=date('y'))!=$area->lastMessageYear) {
			Utils::invalidateGlobalStateCacheDependency("cachecheck.lastmessageyear.area".$area->id);
		}
	}
	public function invalidateAreaCachedBounds() {
		Area::invalidateCachedBounds();
	}
	public function invalidateDependantPageCacheEntries() {
		Utils::invalidatePCacheDependency("cachecheck.pages.area".$this->area_id.".".(date("Y-m-d",strtotime($this->date_time))));
		Utils::invalidatePCacheDependency("cachecheck.pages.global.".(date("Y-m-d",strtotime($this->date_time))));
		
	}
	
	public function updateTagSummaries($action, $refresh=true) {
		switch($action) {
			case "add":
				if (!$this->visible) return;
				$tags=$this->getRelated('tags', $refresh);
				$user=$this->getRelated('authorUser', true);
				$marea=$this->getRelated('area',true);
				$areas=Area::model()->findAllByPk($marea->getParentIds(true));
				
				foreach ($areas as $area) {
					foreach ($tags as $tag) {
						if (!$tag->visible) continue;
					
						$ts_user_area=TagSummary::model()->findByAttributes(array(
							'tag_id'=>$tag->id,
							'area_id'=>$area->id,
							'user_id'=>$user->id
						));
						if ($ts_user_area==null) {
							$ts_user_area=new TagSummary();
							$ts_user_area->tag_id=$tag->id;
							$ts_user_area->area_id=$area->id;
							$ts_user_area->user_id=$user->id;
							$ts_user_area->times_used=0;
							$ts_user_area->authors_used=0;
							$ts_user_area->priority_order=0;
							$ts_user_area->featured=0;
						}
						$ts_user_area->times_used+=1;
						$ts_user_area->save(false);
					
						if (!$user->visible) continue;
						
						$ts_area=TagSummary::model()->findByAttributes(array(
							'tag_id'=>$tag->id,
							'area_id'=>$area->id,
							'user_id'=>-1
						));
					
						if ($ts_area==null) {
							$ts_area=new TagSummary();
							$ts_area->tag_id=$tag->id;
							$ts_area->area_id=$area->id;
							$ts_area->user_id=-1;
							$ts_area->times_used=0;
							$ts_area->authors_used=0;
							$ts_area->priority_order=0;
							$ts_area->featured=0;
							$featured=TagFeaturedArea::model()->findByAttributes(array(
								'tag_id'=>$tag->id,
								'area_id'=>$area->id
							));
							if ($featured!=null && $featured->visible) {
								$ts_area->featured=1;
							}
						}
						$ts_area->times_used+=1;
						$ts_area->priority_order=1;
						if ($ts_user_area->times_used==1) $ts_area->authors_used+=1;
						$ts_area->save(false);
						
						
					}
				}
				
				
				foreach ($tags as $tag) {
					if (!$tag->visible) continue;
					
					$ts_user=TagSummary::model()->findByAttributes(array(
						'tag_id'=>$tag->id,
						'area_id'=>-1,
						'user_id'=>$user->id
					));
					if ($ts_user==null) {
						$ts_user=new TagSummary();
						$ts_user->tag_id=$tag->id;
						$ts_user->area_id=-1;
						$ts_user->user_id=$user->id;
						$ts_user->times_used=0;
						$ts_user->authors_used=0;
						$ts_user->priority_order=0;
						$ts_user->featured=0;
					}
					$ts_user->times_used+=1;
					$ts_user->save(false);
					
					if (!$user->visible) continue;
					
					$ts_global=TagSummary::model()->findByAttributes(array(
						'tag_id'=>$tag->id,
						'area_id'=>-1,
						'user_id'=>-1
					));
					if ($ts_global==null) {
						$ts_global=new TagSummary();
						$ts_global->tag_id=$tag->id;
						$ts_global->area_id=-1;
						$ts_global->user_id=-1;
						$ts_global->times_used=0;
						$ts_global->authors_used=0;
						$ts_global->priority_order=0;
						$ts_global->featured=0;
					}
					$ts_global->priority_order=1;
					$ts_global->times_used+=1;
					if ($ts_user->times_used==1) $ts_global->authors_used+=1;
					$ts_global->save(false);
				}
				
			
			break;
			case "delete":
				$tags=$this->getRelated('tags', $refresh);
				$user=$this->getRelated('authorUser', true);
				$marea=$this->getRelated('area', true);
				$areas=Area::model()->findAllByPk($marea->getParentIds(true));
				
				foreach ($areas as $area) {
					foreach ($tags as $tag) {
						if (!$tag->visible) continue;
						
						$ts_user_area=TagSummary::model()->findByAttributes(array(
							'tag_id'=>$tag->id,
							'area_id'=>$area->id,
							'user_id'=>$user->id
						));
						if ($ts_user_area==null) {
							continue;
						}
						if ($ts_user_area->times_used>0) {
							$ts_user_area->times_used-=1;
							$ts_user_area->save(false);
						}
						else continue;
						
						$ts_area=TagSummary::model()->findByAttributes(array(
							'tag_id'=>$tag->id,
							'area_id'=>$area->id,
							'user_id'=>-1
						));
					
						if (!$user->visible) continue;
						if ($ts_area==null) {
							continue;
						}
						if ($ts_area->times_used>0) {
							$ts_area->times_used-=1;
							if ($ts_user_area->times_used==0) {
								if ($ts_area->authors_used>0)
									$ts_area->authors_used-=1;
							
							}
							$ts_area->save(false);
						}
						else continue;
					
						
					}
				}
				
				foreach ($tags as $tag) {
					if (!$tag->visible) continue;
					
					$ts_user=TagSummary::model()->findByAttributes(array(
						'tag_id'=>$tag->id,
						'area_id'=>-1,
						'user_id'=>$user->id
					));
					if ($ts_user==null) {
						continue;
					}
					if ($ts_user->times_used>0) {
						$ts_user->times_used-=1;
						$ts_user->save(false);
					}
					else continue;
					
					if (!$user->visible) continue;
					
					$ts_global=TagSummary::model()->findByAttributes(array(
						'tag_id'=>$tag->id,
						'area_id'=>-1,
						'user_id'=>-1
					));
					if ($ts_global==null) {
						continue;
					}
					if ($ts_global->times_used>0) {
						$ts_global->times_used-=1;
						if ($ts_user->times_used==0) {
							if ($ts_global->authors_used>0)
								$ts_global->authors_used-=1;
						}
						$ts_global->save(false);
					}
				}
				
			
			break;
		}
	}
	
	public function deleteExternalPublications() {
		foreach ($this->externalPublications as $ep) {
			$ep->delete();
		}
	}
	
	public function getApiProperties() {
		$attachments=array();
		$comments=array();
		foreach ($this->attachments as $attachment) {
			if ($attachment->visible || $this->pending) $attachments[]=$attachment->getApiProperties();
		}
		foreach ($this->comments as $comment) {
			if ($comment->visible || $comment->pending) {
				if ($comment->authorUser->visible || $comment->authorUser->testchannel==Yii::app()->request->testChannel) {
					$comments[]=$comment->getApiProperties();
				}
			}
		}
		$tags=array();
		foreach ($this->tags as $tag) {
			if ($tag->visible) $tags[]=$tag->getApiProperties();
		};
		return array(
			'id'=>$this->id,
			'visible'=>$this->visible,
			'dateTime'=>$this->printDateTime(),
			'text'=>$this->text,
			'text_visible'=>$this->text_visible,
			'latitude'=>$this->latitude,
			'longitude'=>$this->longitude,
			'address'=>$this->address,
			'authorUser'=>$this->authorUser->getApiProperties(),
			'attachments'=>$attachments,
			'tagsText'=>$this->printTags(),
			'tags'=>$tags,
			'comments'=>$comments
		);
	}
}















