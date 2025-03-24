<?php
/**
 * Controller is the customized base controller class.
 * All controller classes for this application should extend from this base class.
 */
class Controller extends CController
{
	protected $_requestedMessage=false;
	protected $_requestedComment=false;
	protected $_requestedAttachment=false;
	protected $_areaOfRequestedMessage=false;
	protected $_areaOfRequestedComment=false;
	protected $_requestedLanguage=false;
	
	protected $_requestedMediaArticle=false;
	protected $_areaOfRequestedMediaArticle=false;
	protected $_requestedMediaFilter=false;
	protected $_areaOfRequestedMediaFilter=false;
	protected $_requestedMedium=false;
	protected $_areaOfRequestedMedium=false;
	
	protected $_requestedModels=array();
	
	protected $__pageTitle;
	protected $_outputCache;
	protected $_cacheDependencies=array();
	
	protected $_bodyclass=array();
	
	
	/**
	 * @var string the default layout for the controller view. Defaults to '//layouts/column1',
	 * meaning using a single column layout. See 'protected/views/layouts/column1.php'.
	 */
	public $layout='//layouts/column1';
	/**
	 * @var array context menu items. This property will be assigned to {@link CMenu::items}.
	 */
	public $menu=array();
	/**
	 * @var array the breadcrumbs of the current page. The value of this property will
	 * be assigned to {@link CBreadcrumbs::links}. Please refer to {@link CBreadcrumbs::links}
	 * for more details on how to specify this property.
	 */
	public $breadcrumbs=array();
	
	public $expoLangs;
	public $expoDates;
	public $expoAllDates;
	
	public $expoAllowScroll=false;
	
	
	
	public function filterAccessControl ($filterChain) {
		$filter=new AccessControlFilter;
		$filter->setRules($this->accessRules());
		$filter->filter($filterChain);
	}
	
	protected function beforeAction($action) {
		
		
		
		
		Yii::log(" * Time before running action: ".Yii::getLogger()->executionTime, 'profile');
		return true;
	}
	
	public function runAction($action) {
		
		parent::runAction($action);
	}
	
	public function run($actionId) {
		
		if (($this->id!='site' || (!in_array($actionId, ['login', 'logout', 'error']))) &&
		    ($this->id!='message' || $actionId!='move')) 
		{
			//Yii::log("Setting return url: " . $this->id."/".$actionId, "info");
			Yii::app()->user->setReturnUrl(Yii::app()->request->getUrl());
			Yii::app()->user->setReturnUrlArray(array(
				$this->id."/".$actionId,
				'in'=>($ca=$this->currentArea)?$ca->id:null
			));
		
		}
		/*else {
			Yii::app()->user->setReturnUrl(null, null);
		}*/
		parent::run($actionId);
	}
	
	public function getCurrentArea() {
		return Yii::app()->request->currentArea;
	}
	
	public function initBreadcrumbs() {
		$this->breadcrumbs=array(
		);
		
		if ($this->currentArea) {
			$a=$this->currentArea;
			while ($a) {
				$this->breadcrumbs[$a->actualDisplayName]=array(
					'message/index', 
					'in'=>$a
				);
				$a=$a->parentArea;
			}
			$this->breadcrumbs=array_reverse($this->breadcrumbs);
		}
	}
	
	public function fixBreadcrumbs() {
		$fixed=array();
		for ($i=0; $i<2; $i++) {
			foreach ($this->breadcrumbs as $label=>$link) {
				if ($i==0 && is_string($label)) $fixed[$label]=$link;
				if ($i==1 && !is_string($label)) $fixed[$label]=$link;
			}
		}
		$this->breadcrumbs=$fixed;
	}
	
	public function getRequestedModel($modelName, $controllerId=null, $altnames=null) {
		if (!isset($this->_requestedModels[$modelName])) {
			$lcModelName=strtolower($modelName);
			if ($controllerId==null) $controllerId=$lcModelName;
			if ($altnames===null) $altnames=array($lcModelName."_id");
			if (is_string($altnames)) $altnames=array($altnames);
			$id=-1;
			if ($this->id==$controllerId && isset($_GET['id'])) $id=$_GET['id'];
			else foreach ($altnames as $name) {
				if (isset($_GET[$name])) $id=$_GET[$name];
			}
			if ($id>=0) $this->_requestedModels[$modelName]=ActiveRecord::model($modelName)->findByPk($id);
			else $this->_requestedModels[$modelName]=false;
			if ($this->_requestedModels[$modelName]===null) $this->_requestedModels[$modelName]=false;
		}
		if ($this->_requestedModels[$modelName]===false) return null;
		else return $this->_requestedModels[$modelName];
	}
	
	
	public function getRequestedMessage() {
		return $this->getRequestedModel('Message');
	}
	public function getRequestedComment() {
		return $this->getRequestedModel('Comment');
	}
	public function getRequestedAttachment() {
		return $this->getRequestedModel('Attachment');
	}
	public function getRequestedUser() {
		return $this->getRequestedModel('User');
	}
	
	public function getAreaOfRequestedMessage() {
		if (($message=$this->getRequestedMessage())==null) return null;
		else return $message->area;
	}
	public function getAreaOfRequestedComment() {
		if (($comment=$this->getRequestedComment())==null) return null;
		else return $comment->message->area;
	}
	
	public function getRequestedLanguage() {
		return $this->getRequestedModel('Language');
	}
	
	
	public function getLanguageOfRequestedTagTranslation() {
		//////
	}
	
	public function getRequestedMediaArticle() {
		return $this->getRequestedModel('MediaArticle', 'mediaArticle', array('article_id'));
	}
	public function getAreaOfRequestedMediaArticle() {
		if (($mediaArticle=$this->getRequestedMediaArticle())==null) return null;
		else return $mediaArticle->area;
	}
	public function getRequestedMediaFilter() {
		return $this->getRequestedModel('MediaFilter', 'mediaFilter', 'filter_id');
	}
	public function getAreaOfRequestedMediaFilter() {
		if (($mediaFilter=$this->getRequestedMediaFilter())==null) return null;
		else return $mediaFilter->area;
	}
	public function getRequestedMedium() {
		return $this->getRequestedModel('Medium');
	}
	public function getAreaOfRequestedMedium() {
		if (($medium=$this->getRequestedMedium())==null) return null;
		else return $medium->area;
	}
	
	
	public function getAreaOfRequestedUser() {
		if (($user=$this->getRequestedUser())==null) return null;
		else return $user->currentArea;
	}
	
	
	
	public function getRightMenu() {
		return Yii::app()->mainMenu->getRightMenu();
	}
	public function getLeftMenu() {
		return Yii::app()->mainMenu->getLeftMenu();
	}
	public function getUniqueMenu() {
		return Yii::app()->mainMenu->getUniqueMenu();
	}
	
	public function setPageTitle($title) {
		parent::setPageTitle($title);
		$this->__pageTitle=$title;
	}
	
	public function getPageTitle() {
		if (!isset($this->__pageTitle)) {
			$title="";
			if ($this->currentArea!=null) {
				$title=$this->currentArea->actualDisplayName;
			}
			if ($title) $title.=" - ";
			$title.=I::t('global.title');
			if (!isset($title) || trim($title)=='' || strpos($title, '.title')!==false) $title=I::tname(Yii::app()->name);
			//if ($this->uniqueId!=Yii::app()->defaultController && $this->action!==null && $this->action->id!=$this->defaultAction) {
				$actiontitle=I::tname(I::t('_action.'.$this->getRoute()));
				if (strpos($actiontitle,'_action.')===0) $actiontitle='';
				if ($actiontitle!=null && $actiontitle!='') $title=$actiontitle." - ".$title;
			//}
			if (isset($_GET['author_id'])) {
				$user=User::model()->findByPk($_GET['author_id']);
				if ($user!=null) $title=$user->getActualDisplayName()." - ".$title;
			}
			$this->__pageTitle=$title;
		}
		return $this->__pageTitle;
	}
	
	public function getIsMainIndex() {
		return ($this->id=='site' && $this->action!=null && $this->action->id=='index');
	}
	
	// --- functions that return common content for static pages --
	
	public function getParticipants($useRealNames=true) {
		if ($this->currentArea==null) return '';
		$users=$this->currentArea->getAuthorUsers();
		$ret=array();
		foreach($users as $user) {
			$name=$user->getActualDisplayName();
			if ($useRealNames && $user->real_name!=null && ($tname=trim($user->real_name))!='')
				$name=$tname;
			$ret[]=$name;
		}
		$ret=implode(', ',$ret);
		return $ret;
		
	}
	
	protected function computeTheme() {
		if (Yii::app()->request->isMobile) {
			$theme=Yii::app()->settings->mobile_theme;
			if (!empty($theme)) {
				Yii::app()->theme=$theme;
			}
		}
		else {
			if (Yii::app()->user->isExpo) {
				$theme=Yii::app()->settings->expo_theme;
				if (!empty($theme)) {
					Yii::app()->theme=$theme;
				}
			}
			else {
				$theme=Yii::app()->settings->default_theme;
				if (!empty($theme)) {
					Yii::app()->theme=$theme;
				}
			}
		}
	}
	
	protected function beforeRender($view) {
		Yii::log(" * Time before render: ".Yii::getLogger()->executionTime, 'profile');
		$this->computeTheme();
		return true;
	}
	
	public function processOutput($output) {
		$r=parent::processOutput($output);
		Yii::log(" * Time after processing output: ".Yii::getLogger()->executionTime, 'profile');
		return $r;
	}
	
	protected function afterRender($view, &$output) {
		Yii::log(" * Time after render: ".Yii::getLogger()->executionTime, 'profile');
		if (!Yii::app()->user->isKiosk) {
			return;
		}
		$routput=preg_replace_callback(
			'|(<a)(\s+.*?)(href="(.*?)")(.*?)(>)(.*?)(</a.*?>)|',
			create_function(
				'$matches',
				'
				$url=$matches[4];
				if (Yii::app()->urlManager->isValidKioskUrl($url)) return $matches[0];
				else return "<span".$matches[2].$matches[5].">".$matches[7]."</span>";
				'
			),
			$output
		);
		$output=$routput;
	}
	
	public function redirectToObtainAccessToken($app) {
		switch ($app) {
			case AccessToken::APPLICATION_FACEBOOK:
				$url=Yii::app()->facebook->getLoginUrl(array(
					'redirect_uri'=>$this->createAbsoluteUrl('saveFacebookAccessToken'), 
					'scope' => "read_stream,publish_stream,offline_access,user_photos"
				));
				
			break;
			case AccessToken::APPLICATION_TWITTER:
				$url=Yii::app()->twitter->getLoginUrl(array(
					'redirect_uri'=>$this->createAbsoluteUrl('saveTwitterAccessToken')
				));
			
			break;
			case AccessToken::APPLICATION_SOUNDCLOUD:
				$url=Yii::app()->soundCloud->getLoginUrl(array(
					'redirect_uri'=>$this->createAbsoluteUrl('saveSoundCloudAccessToken')
				));
			
			break;
			
			
		}
		$this->redirect($url);
	}
	
	public function beginCache($id,$properties=array()) {
		if (!isset($properties['cacheID'])) $properties['cacheID']='pCache';
		$properties['id']=$id;
		$this->_outputCache=$this->beginWidget('OutputCache',$properties);
		$this->_cacheDependencies=array();
		if($this->_outputCache->getIsContentCached())
		{
		    $this->endCache();
		    return false;
		}
		else {
			
		    return true;
		}
	}
	
	public function endCache() {
		$this->_outputCache->dependency=new CChainedCacheDependency($this->_cacheDependencies);
		$this->endWidget('COutputCache');
	}
	public function addCacheDependency($dependency) {
		$this->_cacheDependencies[]=$dependency;
	}
	
	public function addBodyClass($newclass) {
		$newclass=explode(" ", $newclass);
		foreach ($newclass as $c) $this->_bodyclass[$c]=true;
	}
	
	public function getBodyClass() {
		// This won't affect expo mode because expo uses an expo theme, whose public layout doesn't call getBodyClass:
		if (Yii::app()->user->isKiosk) $this->_bodyclass['kioskbody']=true;
		
		// No need to do the same for expo, because the body class is already hard-coded into the expo theme.
		
		return implode(" ", array_keys($this->_bodyclass));
	}
	
	
}
