<?php
class WebApi extends CApplicationComponent {

	protected $secret="8976";
	protected $_actualLanguage;
    protected $_lastStatus = "";



	public function okResponse($array_or_object, $labels=array(), $changeHeader=true, $forceArray=true, $dataField='data', $extraFields=array()) {
		// argument must be a ApiCapable object or an array of such objects
		
		if (!is_string($dataField)) $dataField=false;

        $this->_lastStatus = "ok";
		
		$isarray=$forceArray;
		if (is_array($array_or_object)) {
			$array=$array_or_object;
			$isarray=true;
		}
		else if ($array_or_object===null) {
			$array=array();
		}
		else $array=array($array_or_object);
		
		if ($isarray && !$dataField) $dataField='data';
				
		$ret=array('status'=>'ok');
		$data=array();
		foreach ($array as $object) {
			if ($object instanceof ApiCapable) $ao=$object->getApiProperties();
			else $ao=$object;
			if ($ao!==null || count($array)>1)
				$data[]=$ao;
		}
		
		$this->addExtraInfo($ret);
		
		$actualLabels=array();
		foreach ($labels as $label) {
			$actualLabels[]=array(
				'code'=>$label,
				'text'=>I::t($label, $this->actualLanguage),
			);
		}
		$ret['labels']=$actualLabels;
		
		if ($isarray) {
			$ret[$dataField]=$data;
		}
		else {
			if ($dataField) {
				if (count($data)>0) $ret[$dataField]=$data[0];
				else $ret[$dataField]=null;
			}
			else {
				if (count($data)>0) {
					foreach ($data[0] as $k=>$v) {
						$ret[$k]=$v;
					}
				}
			}
		}
		foreach ($extraFields as $ek=>$ev) {
			if ($ev instanceof ApiCapable) $ret[$ek]=$ev->getApiProperties();
			else $ret[$ek]=$ev;
		}
		
		if ($changeHeader) header("Content-Type: application/json");
		return json_encode($ret);
	}
	
	public function addExtraInfo(&$ret) {
		$ret['languages']=array();
		
		$ret['currentLanguage']=$this->actualLanguage->getApiProperties();
		
		if ($user=Yii::app()->user->model) {
			$languages=$user->currentArea->actualUsedLanguages;
		}
		else if ($area=Yii::app()->request->currentArea) {
			$ret['currentArea']=Yii::app()->request->currentArea->getApiProperties();
			$languages=$area->actualUsedLanguages;
		}
		else $languages=I::languages(true);
		
		if ($user=Yii::app()->user->model) {
			$already=array();
			foreach ($languages as $language) {
				$already[$language->id]=true;
			}
			if (!isset($already[$user->preferred_language_id])) $languages[]=$user->preferredLanguage;
		}
		
		foreach ($languages as $language) {
			$ret['languages'][]=$language->getApiProperties();
		}
		
		$ret['PHPSESSID'] = session_id();
	}
	
	public function getActualLanguage() {
		return I::currentLanguage();
		/*if (!isset($this->_actualLanguage)) {
			$this->_actualLanguage=I::currentLanguage();
		}
		return $this->_actualLanguage;*/
	}
	
	public function forceLanguage($lang) {
		$this->_actualLanguage=Language::get($lang);
	}
	
	public function getUserRegisterInfo($resetNonce=false) {
		$nonceInfo=Yii::app()->user->getState('userRegisterNonceInfo');
		if (!$nonceInfo || $resetNonce || $nonceInfo['timestamp']<time()-3600) {
			$nonceInfo=array(
				'nonce'=>uniqid(),
				'timestamp'=>time(),
			);
			Yii::app()->user->setState('userRegisterNonceInfo', $nonceInfo);
		}
		return array(
			'nonce'=>$nonceInfo['nonce'],
		);
	}
	
	public function checkUserRegisterHash($hash) {
		$info=$this->getUserRegisterInfo();
		if (md5($info['nonce'].$this->secret)==$hash) return true;
		else {
			Yii::log("Invalid user register hash: $hash\n" 
			         ."Correct hash is md5(".$info['nonce'].$this->secret.") = ".md5($info['nonce'].$this->secret), 
			'info');
			if (isset($_REQUEST['User'])) {
				Yii::log(print_r($_REQUEST['User'],true), 'info');
			}
			return false;
		}
	}

    public function checkHash($str, $hash) {
        return md5($str . $this->secret) == $hash;
    }
	
	public function errorResponse($error, $labels=array(), $changeHeader=true, $additionalInfo=array()) {

        $this->_lastStatus = "error";

		$ret=array('status'=>'error');
		if ($error instanceof CModel) {
			$ret['error']=array(
				'message'=>/*I::t('validators.error_summary_header')."\n".*/ implode("\n", array_map(function($a){return implode("\n", $a);},$error->errors))
			);
		}
		else {
			$ret['error']=$error;
		}
		
		$actualLabels=array();
		foreach ($labels as $label) {
			$actualLabels[]=array(
				'code'=>$label,
				'text'=>I::t($label, $this->actualLanguage),
			);
		}
		$ret['labels']=$actualLabels;
		
		$this->addExtraInfo($ret);
		
		foreach ($additionalInfo as $k=>$v) {
			if ($v instanceof ApiCapable) $ret[$k]=$v->getApiProperties();
			else $ret[$k]=$v;
		}
		
		if ($changeHeader) {
			header("Content-Type: application/json");
		}
		return json_encode($ret);
	}

    public function getLastStatus() {
        return $this->_lastStatus;
    }
	
	public function addAllUsefulApiLabels(&$apiLabels) {
		array_splice($apiLabels, 0, 0, array_merge(array(
			
		), array_map(function($o){
		
				return $o->name;
		
			}, Iftext::model()->findAll("name LIKE 'app2.%'")
		)));
	}
}
