<?php

/**
 * This is the model class for table "attachment".
 *
 * The followings are the available columns in table 'attachment':
 * @property integer $id
 * @property integer $type
 * @property string $local_filename
 * @property string $local_original_filename
 * @property string $external_url
 * @property integer $visible
 * @property integer $width
 * @property integer $height
 * @property string $duration
 * @property integer $message_id
 *
 * The followings are the available model relations:
 * @property Message $message
 * @property ExternalPublication[] $externalPublications
 */
class Attachment extends ActiveRecord
{

	const TYPE_IMAGE=1;
	const TYPE_AUDIO=2;
	const TYPE_VIDEO=3;
	const TYPE_UNKNOWN=0;
	
	const ORIGINAL_FILES_PATH='original/';
	
	private $_displayImageSize;

	private static $_typelabels=array(
		self::TYPE_IMAGE=>'image',
		self::TYPE_AUDIO=>'audio',
		self::TYPE_VIDEO=>'video',
		self::TYPE_UNKNOWN=>'unknown');

	/**
	 * Returns the static model of the specified AR class.
	 * @param string $className active record class name.
	 * @return Attachment the static model class
	 */
	public static function model($className=__CLASS__)
	{
		return parent::model($className);
	}

	public static function getFullPathOfFile($filename) {
		return Yii::getPathOfAlias('webroot.uploads')."/".$filename;
	}
	
	public static function saveFailedUpload($uploadedFile) {
		Yii::log('Uploaded file has error or cannot be attached: name: '.$uploadedFile->name.' tmpName: '.$uploadedFile->tempName.' size: '.$uploadedFile->size.' error: '.$uploadedFile->error, 'warning');
		if ($uploadedFile->size>0) {
			$filename=Yii::getPathOfAlias('webroot.uploads.failed')."/".date('Y-m-d_H.i.s');
			while (file_exists($filename.$uploadedFile->name)) {
				$filename.="_";
			}
			$filename.=$uploadedFile->name;
			$uploadedFile->saveAs($filename,false);
			Yii::log('A copy of the failed uploaded file ('.$uploadedFile->name.'/'.$uploadedFile->tempName.') has been saved to '.$filename);
		}
	}

	public function setUploadedFile($uploadedFile) {

		if (!($uploadedFile instanceof CUploadedFile)) {
                        throw new CHttpException(500, 'This is not an uploaded file');
                }
                Yii::trace('Saving uploaded file for attachment: '.$uploadedFile->name.' ('.$uploadedFile->tempName.' size: '.$uploadedFile->size.' error: '.$uploadedFile->error.')');
		try {
                        $tmpfile='/tmp/upload.'.$uploadedFile->extensionName;
                        if (!$uploadedFile->saveAs($tmpfile,false)) {
                                throw new CException('Could not write temporary file');
                        }
                        $mimetype=CFileHelper::getMimeType($tmpfile);
			
			if (strpos($mimetype,"audio")!==false) {
				$this->type=self::TYPE_AUDIO;
			}
			else if (strpos($mimetype,"video")!==false) {
				$this->type=self::TYPE_VIDEO;
			}
			else if (strpos($mimetype,"image")!==false) {
				$this->type=self::TYPE_IMAGE;
			}
			
			// Temporary hack until we can use ffmpeg:
			if ($this->type!=self::TYPE_IMAGE) {
				$extmap=array(
					'3gp'=>self::TYPE_VIDEO,
					'3gpp'=>self::TYPE_AUDIO,
					'amr'=>self::TYPE_AUDIO,
					'wav'=>self::TYPE_AUDIO,
				);
				if (isset($extmap[strtolower($uploadedFile->extensionName)])) {
					$this->type=$extmap[strtolower($uploadedFile->extensionName)];
				}
			}


			$this->save(false);
			Yii::trace("Pre-saved attachment ".$this->id." type ".$this->type." >".$this->local_filename);
			//$filepath=Yii::getPathOfAlias("webroot.uploads");
			$filepath=$this->generateFileName($uploadedFile->extensionName);
			Yii::trace("File path will be: $filepath");
			@$ok=$uploadedFile->saveAs(Yii::getPathOfAlias("webroot.uploads")."/".$filepath,false);
			if (!$ok) throw new CException('copy failed');
			$this->local_filename=$filepath;
			$this->save();
			
		}
		catch (Exception $e) {
		        Yii::log('Failed to save uploaded file as attachment. '.$e->getTraceAsString(),'error');
		        self::saveFailedUpload($uploadedFile,$this->message,$this);
		        return false;
		}
	}
	public function setUploadedImageFile($uploadedImageFilePath) {
		try {
                        $this->type=self::TYPE_IMAGE;
			
			$extension=substr($uploadedImageFilePath,strrpos($uploadedImageFilePath,".")+1);
			
			$this->save(false);
			//$filepath=Yii::getPathOfAlias("webroot.uploads");
			$filepath=$this->generateFileName($extension);
			@$ok=copy($uploadedImageFilePath,Yii::getPathOfAlias("webroot.uploads")."/".$filepath);
			if (!isset($ok) || !$ok) throw new CException('copy failed');
			$this->local_filename=$filepath;
			$this->save();
			
		}
		catch (Exception $e) {
		        Yii::log('Failed to save previously uploaded image as attachment. '.$e->getTraceAsString(),'error');
		        return false;
		}
	}
	public function setDataUri($uri) {
		$parts=explode("base64,", $uri);
		if (count($parts)<2) {
			Yii::log("Malformed data uri for attachment: $uri", 'error');
			return false;
		}
		$typeparts=explode(":",$parts[0]);
		if (count($typeparts)<2) {
			Yii::log("Malformed data uri for attachment: $uri", 'error');
			return false;
		}
		$data=$parts[1];
		$type=rtrim($typeparts[1],";");
		if (strpos($type, "image")===0) {
			$this->type=self::TYPE_IMAGE;
			$extension='jpg';
		}
		else if (strpos($type, "audio")===0) {
			$this->type=self::TYPE_AUDIO;
			$extension='amr';
		}
		else {
			Yii::log("Unknown mime type in data uri for attachment: $type", "error");
			$this->type=self::TYPE_UNKNOWN;
		}
		$extparts=explode("/",$type);
		if (count($extparts)>=2) {
			$extension=$extparts[1];
			if ($extension=="jpeg") $extension="jpg";
		}
		$filepath=$this->generateFileName($extension);
		$file=fopen(Yii::getPathOfAlias("webroot.uploads")."/".$filepath,'wb');
        	fwrite($file, base64_decode($data));
        	fclose($file);
        	@chmod(Yii::getPathOfAlias("webroot.uploads")."/".$filepath,0666);
        	$this->local_filename=$filepath;
        	$this->save();
	}


	/**
	 * @return string the associated database table name
	 */
	public function tableName()
	{
		return 'attachment';
	}

	/**
	 * @return array validation rules for model attributes.
	 */
	public function rules()
	{
		// NOTE: you should only define rules for those attributes that
		// will receive user inputs.
		return array(
			// The following rule is used by search().
			// Please remove those attributes that should not be searched.
			array('id, type, local_filename, local_original_filename, external_url, visible, width, height, duration, message_id', 'safe', 'on'=>'search'),
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
			'message' => array(self::BELONGS_TO, 'Message', 'message_id'),
			'externalPublications' => array(self::HAS_MANY, 'ExternalPublication', 'attachment_id'),
			'playedBy' => array(self::MANY_MANY, 'User', 'user_played_attachment(attachment_id,user_id)'),
		);
	}
	
	
	
	public function ofGivenTypes($types=array(-1))
	{
		if ($types===null) $types=array();
		if (!is_array($types)) $types=array($types);
		if (count($types)==0) $types[]=-1;
		
		$this->getDbCriteria()->mergeWith(array(
		    'condition'=>'type IN ('.implode(',',$types).')',
		));
		return $this;
	}
	public function ofGivenType($type) {
		return $this->ofGivenTypes($type);
	}
	
	public function onlyVideo() {
		return $this->ofGivenTypes(array(self::TYPE_VIDEO));
	}
	public function onlyImage() {
		return $this->ofGivenTypes(array(self::TYPE_IMAGE));
	}
	public function onlyAudio() {
		return $this->ofGivenTypes(array(self::TYPE_AUDIO));
	}
	
	public function onlyVisible() {
		$ta=$this->getTableAlias();
		$this->getDbCriteria()->mergeWith(array(
			'condition'=>"$ta.visible=1",
		));
		return $this;
	}
	
	
	/**
	 * @return array customized attribute labels (name=>label)
	 */
	public function attributeLabels()
	{
		return array(
			'id' => 'ID',
			'type' => 'Type',
			'local_filename' => 'Local Filename',
			'local_original_filename' => 'Local Original Filename',
			'external_url' => 'External Url',
			'visible' => 'Visible',
			'width' => 'Width',
			'height' => 'Height',
			'duration' => 'Duration',
			'message_id' => 'Message',
		);
	}
	
	public function beforeSave() {
		if (parent::beforeSave()){
			if ($this->isNewRecord) {
				if (!isset($this->visible)) $this->visible=false;
				if (!isset($this->type)) $this->type=self::TYPE_UNKNOWN;
			}
			if ($this->type==self::TYPE_IMAGE) {
				$file=self::getFullPathOfFile($this->local_filename);
				$size=@getimagesize($file);
				if ($size!==false) {
					$this->width=$size[0];
					$this->height=$size[1];
				}
				else {
					Yii::log("Could not get image size for image attachment $file", "warning");
				}
			}
			return true;
		}
		else return false;
		
	}
	
	public function getLastPlayed() {
		if (!Yii::app()->hasComponent('user')) return false;
		return Yii::app()->user->getLastPlayedAttachment($this->id);
		
	}
	
	public function process() {
		// resize image if too big
		// publish video to Youtube
		// convert audio to mp3
		$info=null;
		Yii::log('(post)Processing attachment '.$this->id.' '.$this->local_filename);
		
				
		switch ($this->type) {
			case self::TYPE_IMAGE: $info=$this->processImage(); break;
			case self::TYPE_AUDIO: $info=$this->processAudio(); break;
			case self::TYPE_VIDEO: $info=$this->processVideo(); break;
			case self::TYPE_UNKNOWN: $info=$this->processUnknown(); break; 
		
		}
		// common actions:		
		//Yii::trace('Specific processing returned: '.print_r($info,true));
		if ($info!=null && isset($info['newfile'])) {
			if ($this->local_original_filename!=null) {
				Yii::log('File '.$this->local_filename.' already had an older version '.$this->local_original_filename.' which will be forgotten. Newer version being created as '.$info['newfile'],'warning');
			}
			$this->local_original_filename=$this->local_filename;
			$this->moveOriginalFile();
			$this->local_filename=$info['newfile'];
		}
		if ($this->type==self::TYPE_AUDIO || $this->type==self::TYPE_VIDEO) {
			$duration=MediaHelper::getMediaFileDuration(self::getFullPathOfFile($this->local_filename));
			if ($duration!==false) $this->duration=$duration;
		}
		
		if ($this->type!=self::TYPE_UNKNOWN && isset($info) && !isset($info['error'])) $this->visible=true;
		else $this->visible=false;
		$this->save(false);
		
		return $info;
	}
	
	public function getOriginalFilePathPrefix() {
		return self::ORIGINAL_FILES_PATH;
	}
	
	public function moveOriginalFile() {
		if (!$this->local_original_filename) throw new Exception("Cannot move original file for attachment ".$this->id.": attachment doesn't have any original file");
		if (strpos($this->local_original_filename, $this->getOriginalFilePathPrefix())===0) {
			Yii::log('Attachment original file '.$this->local_original_filename.' is already in the "original files" subolder', 'warning');
			return false;
		}
		$newfilename=$this->getOriginalFilePathPrefix().$this->local_original_filename;
		$src=self::getFullPathOfFile($this->local_original_filename);
		$tgt=self::getFullPathOfFile($newfilename);
		if (!file_exists($src)) {
			Yii::log("Cannot move file $src. File does not exist.", 'warning');
			return false;
		}
		if ($src==$tgt) {
			Yii::log("Attempt to move attachment original file $src to the same location", 'warning');
			return false;
		}
		if (file_exists($tgt)) {
			Yii::log("Failed to move file $src to $tgt. Destination file already exists.", 'error');
			return false;
		}
		if (!rename($src, $tgt)) {
			Yii::log("Failed to move $src to $tgt. Reason unknown.", 'error');
			return false;
		}
		if (!file_exists($tgt)) {
			Yii::log("Error moving file $src to $tgt. rename() returned true but the target file does not exist after moving.", 'error');
			return false;
		}
		$this->local_original_filename = $newfilename;
		Yii::log("Succesfully moved $src to $tgt. (NOTE: attachment record not updated at the time of this log message).", 'info');
		return true;
	}
	
	public function stripExif() {
		$srcfile=$this->local_filename;
		
		$orientation=MediaHelper::getImageSize(self::getFullPathOfFile($srcfile));	
		
		if ($orientation[2]<=1) return false;
	
		$tgtfile=FileHelper::getFilePathWithoutExtension($srcfile)."_exifstripped.".FileHelper::getExtension($srcfile);
		MediaHelper::stripExifFromImage(self::getFullPathOfFile($srcfile),self::getFullPathOfFile($tgtfile));
		if (file_exists(self::getFullPathOfFile($tgtfile))) {
			$this->local_original_filename=$this->local_filename;
			$this->moveOriginalFile();
			$this->local_filename=$tgtfile;
			if ($this->save()) return "OK";
			else return "Could not save attachment";
		}	
		else return "Error stripping exif";
		
	}
	
	public function processImage() {
		$info=array();
		$geo=MediaHelper::getGeoCoordsFromImage(self::getFullPathOfFile($this->local_filename));
		if ($geo!=null && isset($geo['latitude']) && isset($geo['longitude'])) {
			$info['latitude']=$geo['latitude'];
			$info['longitude']=$geo['longitude'];
		}
		$srcfile=$this->local_filename;
		$imagesize=MediaHelper::getImageSize($fullsrcfile=self::getFullPathOfFile($srcfile));
		if (($hasExifRotation=($imagesize[2]!=1)) || Yii::app()->settings->getSetting('resizeBigImages',$this->message->area)) {
			
			$maxsize=Yii::app()->settings->getSetting('maxImageSizeStored',$this->message->area);
			$maxsize[0]=min($maxsize[0],$imagesize[0]);
			$maxsize[1]=min($maxsize[1],$imagesize[1]);
			if ($imagesize!==false) { 
				if ($hasExifRotation || $imagesize[0]>$maxsize[0] ||
					$imagesize[1]>$maxsize[1]) 
				{
					$tgtfile=FileHelper::getFilePathWithoutExtension($srcfile)."_resized.".FileHelper::getExtension($srcfile);
					MediaHelper::resizeImage(self::getFullPathOfFile($srcfile),$maxsize,self::getFullPathOfFile($tgtfile));
					if (file_exists(self::getFullPathOfFile($tgtfile))) {
						$info['newfile']=$tgtfile;
					}	
				}
			}
			else {
				$info['error']="Could not get image size of file ".$this->local_filename.". The image file may be corrupt";
				Yii::log($info['error'], 'error');
			}
		}	
		

		return $info;

	}
	public function processAudio() {
		$info=array();
		$convertaudio=Yii::app()->settings->getSetting('convertAudioToMp3',$this->message->area);
		if (strtolower(FileHelper::getExtension($this->local_filename))!='mp3' && $convertaudio[0]) {
			$targetfile=FileHelper::getFilePathWithoutExtension($this->local_filename)."_converted.mp3";
			$targetfilefullpath=self::getFullPathOfFile($targetfile);
			MediaHelper::convertAudioFileToMp3(self::getFullPathOfFile($this->local_filename),$convertaudio,$targetfilefullpath);
			if (file_exists($targetfilefullpath)) {
				$info['newfile']=$targetfile;
			}
			else {
				$info['error']='Could not convert audio '.$this->local_filename;
				Yii::log($info['error'], 'error');
			}		
		}
		if (Yii::app()->settings->getSetting('audioTranscriptionEnabled', $this->message->area)) {
			$info['transcription']=$this->getAudioTranscription();
		}
		return $info;
	}
	public function processVideo() {
		$info=array();
		$convertvideo=Yii::app()->settings->getSetting('convertVideoToFlash',$this->message->area);
		$ext=$convertvideo['extension'];
		if ($convertvideo[0] && strtolower(FileHelper::getExtension($this->local_filename))!=$ext) {
                        $targetfile=FileHelper::getFilePathWithoutExtension($this->local_filename)."_converted.".$ext;
                        $targetfilefullpath=self::getFullPathOfFile($targetfile);
                        MediaHelper::convertVideoFileToFlash(self::getFullPathOfFile($this->local_filename),$convertvideo,$targetfilefullpath);
                        if (file_exists($targetfilefullpath)) {
                                $info['newfile']=$targetfile;
                        }
                        else {
                        		$info['error']='Could not convert video '.$this->local_filename;
                                Yii::log($info['error'], 'error');
                        }
		}
		$yt=Yii::app()->settings->getSetting('publishVideoOnYouTube',$this->message->area);
		if ($yt) $this->publishVideoOnYouTube();	
		return $info;
	}
	public function processUnknown() {
		Yii::log('Unknown type of attachment '.$this->id.' of message '.$this->message->id.' by '.$this->message->authorUser->adminName.' file: '.$this->local_filename,'warning');
		return array();
	}
	
	public function getAudioTranscription() {
		$flacfile=self::getFullPathOfFile('tmp/'.$this->local_filename.".flac");
		$srcfile=self::getFullPathOfFile($this->local_filename);
		MediaHelper::convertAudioFileToFlac($srcfile,array('samplingRate'=>Yii::app()->speechRecognition->sampleRate),$flacfile);
		if (file_exists($flacfile)) {
			$duration=MediaHelper::getMediaFileDuration($flacfile);
			$filesize=filesize($flacfile);
			$langCode=$this->message->authorUser->preferredLanguage->extended_code;
			if ($langCode=="") $langCode=$this->message->authorUser->preferredLanguage->code;
			return Yii::app()->speechRecognition->getText($flacfile,$langCode,$filesize/$duration);
		}
		else {
			Yii::log("Couldn't convert $srcfile to $flacfile",'error');
			return null;
		}
	
	}
	
	
	function publishVideoOnYouTube() {
		$file=$this->local_original_filename;
		if ($file==null) $file=$this->local_filename;
		$filepath=self::getFullPathOfFile($file);
		$title="Video by ".$this->message->authorUser->getActualDisplayName().' ('.$this->message->area->name.') '.$this->message->date_time;
		$tags=$this->message->getTagsAsStrings('author');
		$ytid=Yii::app()->youTube->publishVideo($filepath,array('title'=>$title,'tags'=>$tags));
		if ($ytid) {
			$url="http://www.youtube.com/embed/$ytid";
			//Yii::trace('Updating attachment external url: '.$url);
			$this->external_url=$url;
			$this->save(false);
		}
	}
	
	public function getLocalFileUrl($absolute=false) {
		return Yii::app()->getBaseUrl($absolute)."/uploads/".$this->local_filename;
	}
	
	public function getDisplayImageSize($maxsize=null) {
		if ($this->type!=self::TYPE_IMAGE) throw new CException('Attachment is not an image');
		if ($this->_displayImageSize==null) {
			$this->_displayImageSize=array(0,0);
			
			if ($this->width>0 && $this->height>0) {
				if ($maxsize===null || $maxsize===array()) $maxsize=Yii::app()->settings->maxImageSizeDisplayed;
				$maxwidth=$maxsize[0];
				$maxheight=$maxsize[1];
				$scale=min(1,min($maxwidth/$this->width, $maxheight/$this->height));
				$this->_displayImageSize[0]=$this->width*$scale;
				$this->_displayImageSize[1]=$this->height*$scale;
			}
			else Yii::log('Missing size data in DB for image attachment '.$this->local_filename, 'warning');
			
		}
		return $this->_displayImageSize;
	}
	
	public function rotateImage($direction) {
		if ($this->type!=self::TYPE_IMAGE) throw new CException('Only image attachments can be rotated');
		$oldname=$this->local_filename;
		$basename=FileHelper::getFilePathWithoutExtension($oldname);
		$extension=FileHelper::getExtension($oldname);
		$rotation=$direction*90;
		$newname=$basename."_rotate$rotation.".$extension;
		
		$oldfile=self::getFullPathOfFile($oldname);
		$newfile=self::getFullPathOfFile($newname);
		
		$img = imagecreatefromjpeg($oldfile);
		$img = imagerotate($img,$rotation,0);
		
		$ok=false;
		@$ok=imagejpeg($img,$newfile,90);
		imagedestroy($img);
		if ($ok) {
			$this->local_original_filename=$oldname;
			$this->moveOriginalFile();
			$this->local_filename=$newname;
			Yii::log("Saving new rotated image as $newname", "info", "rotate_map");
			$this->save();
			if ($this->message->latitude!=null && $this->message->latitude!=0
			    && $this->message->longitude!=null && $this->message->longitude!=0) {
					$this->message->retrieveMap();
			}
		}
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
		$criteria->with=array(
			'message'=>array(
				'joinType'=>'INNER JOIN',
				'on'=>'message.visible>0'
			),
			'message.authorUser'=>array(
				'joinType'=>'INNER JOIN',
				'on'=>'authorUser.visible>0'
			),
		);

		$criteria->compare('id',$this->id);
		$criteria->compare('type',$this->type);
		//$criteria->compare('local_filename',$this->local_filename,true);
		//$criteria->compare('local_original_filename',$this->local_original_filename,true);
		//$criteria->compare('external_url',$this->external_url,true);
		//$criteria->compare('visible',$this->visible);
		$criteria->compare('width',$this->width);
		$criteria->compare('height',$this->height);
		$criteria->compare('duration',$this->duration,true);
		//$criteria->compare('message_id',$this->message_id);
		if ($currentArea=Yii::app()->request->currentArea) $criteria->compare('message.area_id',$currentArea->id);

		$dp=new CActiveDataProvider($this, array(
			'criteria'=>$criteria,
		));
		$dp->sort->attributes['messageDate']=array(
			'asc'=>'message.date_time',
			'desc'=>'message.date_time DESC',
			'default'=>'desc',
			'label'=>'messageDate'
		);$dp->sort->defaultOrder=array('messageDate'=>CSort::SORT_DESC);
		$dp->pagination->pageSize=50;
		return $dp;
	}
	
	public function generateFileName($extension, $dot='.') {
		return $this->message->area->getCleanName()."_".$this->message->authorUser->getCleanName()."_m".$this->message->id."_a".$this->id."_".self::$_typelabels[$this->type].$dot.$extension;
	}
	
	public function updateFileName() {
		foreach (array('local_filename', 'local_original_filename') as $property) {
			$oldfilename=$this->$property;
			if ($oldfilename) {
				$newfilename=preg_replace('/^[^_]+(_[^_]+_m\d)/', $this->message->area->getCleanName().'\1', $oldfilename);
				if ($newfilename!=$oldfilename) {
					$src=self::getFullPathOfFile($oldfilename);
					$dst=self::getFullPathOfFile($newfilename);
					@$moved=rename($src,$dst);
					if ($moved) {
						$this->$property=$newfilename;
						$this->save(false);
					}
					else {
						Yii::log("Cannot move attachment file $src to $dst", "error");
					}
				}
				else {
					Yii::log("Old and new filename are the same for attachment: $oldfilename", "warning");
				}
			}	
			else {
				Yii::trace("Attachment ".$this->id." doesn't have a $property");
			}
		}
	}
	
	public function getApiProperties() {
		$ret=array(
			'id'=>$this->id,
			'type'=>self::getTypeLabel($this->type),
			'url'=>$this->getLocalFileUrl(true),
			'externalUrl'=>$this->external_url,
			'lastPlayed'=>$this->lastPlayed,
		);
		
		return $ret;
	}
	
	public static function getTypeLabel($type) {
		return self::$_typelabels[$type];
	}
	
	public function orderByType() {
		$ta=$this->getTableAlias();
		$this->getDbCriteria()->mergeWith(array(
			'order'=>"$ta.type, $ta.id",
		));
		return $this;
	}
	
	protected function afterSave() {
		if ($this->message) $this->message->invalidateDependantPageCacheEntries();
		parent::afterSave();
	}
	protected function afterDelete() {
		if ($this->message) $this->message->invalidateDependantPageCacheEntries();
		parent::afterDelete();
	}
}
