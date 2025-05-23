<?php

class MessageController extends Controller
{

	// Note: an action for old-megafone-style editing of all messages will NOT exist
	// Editing will be done in-place from the index/view view via ajax.
	// I'll call the ajax-only action "update" just in case I need a "edit" action
	// which would consist in showing the edit controls (still ajax)

	public $layout='//layouts/public';
	
	public $mobileMenuRendered=false;
	
	private $_selectedAuthor=false;

	public function filters()
	{
		return array(
			'accessControl', 
		);
	}

	
	public function accessRules()
	{
		// TODO: permissions based on currentArea are not reliable, due to how publishing gets re-routed.
		//       This is not relevant in practice but only because we always assign publishing permissions globally.
		return array(
			array('allow',  
				'actions'=>array('index','view','processAttachments','viewSingle', 'search', 'results', 'enableSearch', 'myComments'),
				'users'=>array('*'),
			),
			array('allow', 
				'actions'=>array('publish', 'uploadImage'),
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
			array('allow',
				'actions'=>array('postComment'),
				'roles'=>array(
					'PostComment'=>array(
						'area'=>$this->currentArea,
					),
				),
			),
			array('allow',
				'actions'=>array('hideComment'),
				'roles'=>array(
					'HideComment'=>array(
						'area'=>$this->currentArea,
					),
					'HideOwnComment'=>array(
						'comment'=>$this->requestedComment
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
		//if (Yii::app()->request->isMobile) $this->forward("viewMobile");
		$message=Message::model()->findByPk($id);
		if ($message) {
			$realUrl=$message->getRealUrl();
			$this->redirect($realUrl);
		}
		else throw new CHttpException(404);
	}
	
	public function actionUploadImage() {
		$form=new ImageUploadForm();
		$form->attributes=$_POST['PublishForm'];
		$ok=$form->validate();
		if (!$ok) {
			//Yii::app()->user->setFlash('error', I::t('publish.error.image_upload'));
			//$this->redirect(array('message/publish'));
			$this->redirect(array('message/publish', 'skipImage'=>1));
		}
		$this->redirect(array('message/publish', 'uploadedImage'=>$form->id));
		
	}

	
	/**
	 * Runs Python Tagger submodule to process the audio file.
	 * 
	 * @param string $audioFilePath Path to the WAV/MP3 file
	 * @return array ['tags'=>[['tag'=>'foo','similarity'=>0.7],...], 'transcription'=>'...']
	 */
	protected function useTagger($audioFilePath)
	{
		// Check if the file exists
		if (!file_exists($audioFilePath)) {
			Yii::log("Audio file not found: $audioFilePath", 'error');
			return array('tags' => array(), 'transcription' => '');
		}
		
		// Build the command to execute the script
		$script = "/srv/www/blind.wiki/public_html/Tagger/run_tagger.sh";
		
		// Check if the script exists and is executable
		if (!file_exists($script)) {
			Yii::log("Tagger script not found: $script", 'error');
			return array('tags' => array(), 'transcription' => '');
		}
		
		// Check script permissions
		$permissions = fileperms($script);
		$isExecutable = ($permissions & 0x0040) || ($permissions & 0x0008) || ($permissions & 0x0001);
		Yii::log("Tagger script permissions: " . decoct($permissions) . ", executable: " . ($isExecutable ? 'yes' : 'no'), 'info');
		
		// Use output buffer and direct execution
		$scriptArgument = escapeshellarg($audioFilePath);
		$cmd = "$script $scriptArgument";
		Yii::log("Executing Tagger command: $cmd", 'info');
		
		// Set a longer timeout (5 minutes)
		$defaultTimeout = ini_get('max_execution_time');
		set_time_limit(300);
		
		// Execute command and capture output directly
		$startTime = microtime(true);
		$output = array();
		$ret = 0;
		exec($cmd." 2>&1", $output, $ret);
		$endTime = microtime(true);
		$executionTime = round($endTime - $startTime, 2);
		
		Yii::log("Tagger execution completed in {$executionTime} seconds with exit code: $ret", 'info');
		
		// Reset timeout to default
		set_time_limit($defaultTimeout);
		
		// Log each line of output separately to ensure everything is captured
		Yii::log("Tagger output START", 'info');
		foreach ($output as $index => $line) {
			Yii::log("Tagger output line " . ($index + 1) . ": " . $line, 'info');
		}
		Yii::log("Tagger output END", 'info');
		
		// Use a non-newline separator for the full output
		$fullOutput = implode(" | ", $output);
		Yii::log("Tagger complete output (pipe-separated): " . $fullOutput, 'info');
		
		if ($ret !== 0) {
			Yii::log("Error executing Tagger (code: $ret) - See output above", 'error');
			Yii::log("SUGGESTION: Verify the Tagger script manually by running the following command on the server:", 'error');
			Yii::log("cd /srv/www/blind.wiki/public_html && ./Tagger/run_tagger.sh " . escapeshellarg($audioFilePath), 'error');
			Yii::log("Check for Python dependencies and environment setup", 'error');
			return array('tags' => array(), 'transcription' => '');
		}
		
		// Look for JSON in the console output
		Yii::log("Processing console output from Tagger", 'info');
		
		// Find where the JSON begins (after "Resultado:")
		$jsonLines = array();
		$foundResultado = false;
		
		foreach ($output as $line) {
			if ($foundResultado) {
				$jsonLines[] = $line;
			} elseif (trim($line) === "Resultado:") {
				$foundResultado = true;
			}
		}
		
		// Extract information directly from console output
		$transcription = '';
		$tags = array();
		$outputStr = implode("\n", $output);
		
		// Extract transcription
		if (preg_match('/"transcription":\s*"([^"]*)"/', $outputStr, $matches)) {
			$transcription = $matches[1];
		}
		
		// Extract tags
		preg_match_all('/"tag":\s*"([^"]*)"\s*,\s*"similarity":\s*([\d\.]+)/', $outputStr, $matches, PREG_SET_ORDER);
		foreach ($matches as $match) {
			if (!empty($match[1])) {
				$tags[] = array(
					'tag' => $match[1],
					'similarity' => (float)$match[2]
				);
			}
		}
		
		Yii::log("Extraction completed. Transcription: " . substr($transcription, 0, 50) . "... Tags: " . count($tags), 'info');
		
		return array(
			'transcription' => $transcription,
			'tags' => $tags
		);
	}

	// Modified actionPublish method to integrate Tagger
	public function actionPublish()
	{	
	    
	    // ERROR here. This is broken but this code isn't reached 
	    //       because we have disabled ajax validation
		/*
		if(isset($_POST['ajax']) && $_POST['ajax']==='message-form')
		{
			echo CActiveForm::validate($model);
			Yii::app()->end();
		}
		*/
		
		$message=null;
		$thanks="";
		$form=new PublishForm;
		$user=Yii::app()->user->model;
		$currentArea=$this->currentArea;
		if (Yii::app()->request->isApiRequest || (!$currentArea || $currentArea->isGlobalType)) {
			$currentArea=$user->currentArea;
		}
		$apiLabels=array();
		if ($user==null) throw new CException('Only real users can publish');
		if (isset($_POST['PublishForm'])) {
            $this->_cleanInputTags($_POST['PublishForm']);
			$form->attributes=$_POST['PublishForm'];
			if ($form->validate()) {
				$uploadedfiles=CUploadedFile::getInstances($form,'files');
				$message=new Message;
				if ($form->longitude!="" && $form->latitude!="") {
					$message->longitude=$form->longitude;
					$message->latitude=$form->latitude;
				}
				$message->text=$form->text;
				if (Yii::app()->request->isMobileApp) {
					$devicename='webapp';
				}
				else if (Yii::app()->request->isMobile) {
					$devicename='web_mobile';
				}
				else if (Yii::app()->request->isApiRequest) {
					$devicename='app_unknown';
					if (isset($form->device)) {
						switch ($form->device) {
							case 'ios': $devicename='app_ios'; break;
							case 'android': $devicename='app_android'; break;
						}
					}
				}
				else $devicename='web';
				
				if (!empty($form->address)) $message->address=$form->address;
				
				
				$message->device_string=$devicename;
				
				$message->pending=1;
				$message->visible=0;
				
				if (isset($message->latitude) && $message->latitude!=0 && isset($message->longitude) && $message->longitude!=0
				    && (!$currentArea || $currentArea->isGlobalType)) {
					
					$message->area_id=Area::findNearest($message->latitude, $message->longitude)->id;
				}
				if (!$message->area_id && (!$currentArea || $currentArea->type==Area::TYPE_CATEGORY)) {
					throw new CHttpException(403, I::t('publish.error.location_missing'));
				}
				if (!$message->area_id) $message->area_id=$currentArea->id;
				
				if ($message->save(false)) {
					$thanks=I::t('publish.success');
					$dataUris=array();
					if ($form->audioDataUri!=null) $dataUris[]=$form->audioDataUri;
					$attsuccess=$message->createAttachments($uploadedfiles, isset($_REQUEST['uploadedImage'])?$_REQUEST['uploadedImage']:null, $dataUris);
					$message->setTags($form->tags,$form->newtags);

					
					if (Yii::app()->request->isAjaxRequest) {
						echo json_encode(array('status'=>'OK', 'message'=>array('id'=>$message->id)));
						
						if (function_exists('fastcgi_finish_request')) {
							fastcgi_finish_request();
						} else {
							@ob_end_flush(); // Try to flush Yii's buffer if any
							@flush();         // Try to flush system buffer
							ignore_user_abort(true); // Continue script if client disconnects
							set_time_limit(0); // Allow script to run longer for Tagger
						}
					}
					else if (Yii::app()->request->isApiRequest) {
						// This will echo the response directly
						Yii::app()->api->okResponse($message); 
						
						if (function_exists('fastcgi_finish_request')) {
							fastcgi_finish_request();
						} else {
							@ob_end_flush(); 
							@flush();
							ignore_user_abort(true);
							set_time_limit(0); 
						}
					}
					else { // Normal web request (typically a redirect)
						$form->text=null;
						// $message object is still needed for Tagger, so don't null it yet unless Tagger re-fetches.
						// The Tagger code below uses the $message object.

						$url = '';
						if ($currentArea->type==Area::TYPE_FORUM) {
							$url = $this->createUrl('message/index');
						} else {
							Yii::app()->user->setFlash('success', I::t('publish.success'));
							$url = $this->createUrl('message/publish');
						}
						
						// Manually send redirect headers instead of Yii's $this->redirect() to avoid script termination
						header('Location: ' . $url);
						header('HTTP/1.1 302 Moved Temporarily'); // Or other appropriate redirect status
						// Send minimal body for redirect, or none.
						// echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url='.$url.'"></head><body></body></html>';


						if (function_exists('fastcgi_finish_request')) {
							fastcgi_finish_request();
						} else {
							// Ensure headers are sent
							@ob_end_flush(); // Send headers and any buffered output
							@flush();
							ignore_user_abort(true);
							set_time_limit(0);
						}
					}
					// Tagger Integration - Automatic audio tagging
					// Check use_tagger flag (default true for backward compatibility)
					$useTaggerByDefault = true; // Definir la variable aquí
					$useTagger = (bool) Yii::app()->request->getParam('use_tagger', $useTaggerByDefault);
					Yii::log("Tagger integration starting. useTagger flag: " . ($useTagger ? 'true' : 'false'), 'info');
					
					if ($useTagger && count($message->attachments) > 0) {
						Yii::log("Message has " . count($message->attachments) . " attachments, looking for audio files", 'info');
						
						foreach ($message->attachments as $attachment) {
							// Only process audio files - use the type constant instead of mime_type
							Yii::log("Checking attachment ID: " . $attachment->id . ", type: " . $attachment->type, 'info');
							
							if ($attachment->type == Attachment::TYPE_AUDIO) {
								try {
									// Path to the audio file
									$audioFilePath = Yii::getPathOfAlias('webroot.uploads') . "/". $attachment->local_filename;
									Yii::log("Found audio attachment, path: " . $audioFilePath, 'info');
									
									// Execute the tagger
									$taggerResult = $this->useTagger($audioFilePath);
									Yii::log("Tagger execution completed, processing results", 'info');
									
									// Set message text to transcription if original text is empty
									if (empty($message->text) && !empty($taggerResult['transcription'])) {
										$message->text = $taggerResult['transcription'];
										$message->save(false);
										Yii::log("Text set from transcription: " . substr($message->text, 0, 50) . "...", 'info');
									}
									
									// Extract all tags returned by the tagger
									$autoTags = array();
									if (!empty($taggerResult['tags'])) {
										foreach ($taggerResult['tags'] as $tagInfo) {
											$autoTags[] = $tagInfo['tag'];
										}
										
										if (!empty($autoTags)) {
											// Pass array; second parameter true merges with existing tags
											Yii::log("Adding " . count($autoTags) . " tags to message: " . implode(", ", $autoTags), 'info');
											$message->setNewTags($autoTags, true);
											$message->updateTagSummaries('add');
											$message->save(false);
											
											Yii::log("Tagger: tags added to message {$message->id}: " . implode(',', $autoTags), 'info');
										} else {
											Yii::log("No valid tags found in Tagger results", 'info');
										}
									} else {
										Yii::log("Tagger returned empty tags array", 'info');
									}
								} catch (Exception $e) {
									Yii::log("Error executing Tagger: " . $e->getMessage() . "\n" . $e->getTraceAsString(), 'error');
								}
								
								// Only process the first audio attachment
								Yii::log("Processing complete for first audio attachment", 'info');
								break;
							}
						}
					} else {
						Yii::log("Skipping Tagger integration: useTagger=" . ($useTagger ? 'true' : 'false') . 
							", attachment count=" . count($message->attachments), 'info');
					}
					// End of Tagger Integration
					Yii::app()->end();
				}
				else {
					Attachment::saveFailedUploads($uploadedfiles);
					throw new CHttpException(500,'Form was validated but the message could not be saved');
				}

			}
			else {
				if (Yii::app()->request->isApiRequest) {
					echo Yii::app()->api->errorResponse($form);
					Yii::app()->end();
				}
			}
		}
		
		
		if (Yii::app()->request->isApiRequest) {
			$tags=Tag::getProposedTagsForApi($currentArea, Yii::app()->user->model);
			$ret=(Object)(array('proposedTags'=>$tags));
			echo Yii::app()->api->okResponse($ret, array(), true, false, false);
		}
		else {
			$proposedTags=Tag::getProposedTags($currentArea, $user);
			//Yii::trace('Proposed own tag count: '.count($proposedTags['own']));
		
			$this->render('publish',array(
				'formModel'=>$form,
				'messageModel'=>$message,
				'thanks'=>$thanks,
				'proposedTags'=>$proposedTags,
				'uploadedImageId'=>isset($_REQUEST['uploadedImage'])?$_REQUEST['uploadedImage']:null,
				'skipImage'=>isset($_REQUEST['skipImage']),
			));
		}
	}

    protected function _cleanInputTags(&$array) {
        if (!empty($array['newtags'])) {
            $array['newtags'] = trim($array['newtags'], "# \n\r\t\v\x00");
            $array['newtags'] = preg_replace('~#~isu', ',', $array['newtags']);
        }
        /*if (!empty($array['tags']) && is_array($array['tags'])) {
            foreach($array['tags'] as &$tag) {
                if (!empty($tag) && is_string($tag) && !is_numeric($tag)) {
                    $tag = preg_replace('~#~isu', '', $tag);
                }
            }
        }*/
    }

	// TODO (maybe Ajax only)
	public function actionUpdate($id)
	{
		$this->layout='//layouts/empty';
		$message=Message::model()->findByPk($id);

		// Uncomment the following line if AJAX validation is needed
		// $this->performAjaxValidation($model);
		
		if (isset($_POST['Message']['tags'])) {
			$newTags=$_POST['Message']['tags'];
			unset($_POST['Message']['tags']);
		}
		
		$wasvisible=$message->visible;
		if(isset($_POST['Message']))
		{
			$message->attributes=$_POST['Message'];
			if (isset($newTags)) {
				try {
					if ($wasvisible) $message->updateTagSummaries('delete');
					$message->setNewTags($newTags,true);
					$message->updateTagSummaries('add');
				}
				catch (Exception $e) {
					Yii::log('setNewTags() failed on message '.$message->id.': '.$e->getTraceAsString(), 'error');
				}
			}
			if($message->save()) {
				if (isset($message->latitude) && $message->latitude!=0 && 
					isset($message->longitude) && $message->longitude!=0 &&
					(isset($_POST['Message']['latitude']) || isset($_POST['Message']['longitude']) || 
					isset($_POST['forceRefreshMap'])
					)) {
					
					$message->retrieveMap(false, null, true);
				}
				if (Yii::app()->request->isApiRequest) {
					$message->refresh();
					echo Yii::app()->api->okResponse($message);
					Yii::app()->end();
				}
				$this->redirect(array('viewSingle','id'=>$message->id));
			
			}
		}

		$this->render('_update',array(
			'message'=>$message,
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
		if ($message->visible) {
			$message->deleteExternalPublications();
			$message->visible=false;
			$message->save();
			$message->updateTagSummaries("delete");
			if ($message->authorUser->visible) {
				Yii::app()->db->createCommand("
					UPDATE area SET message_count=IF(message_count>0,message_count-1,0)
					WHERE id IN(".(implode(',',$message->area->getParentIds(true))).")
				")->execute();
			}
		}
		if (Yii::app()->request->isApiRequest) {
			echo Yii::app()->api->okResponse(array());
			Yii::app()->end();
		}
		$this->redirect(array('viewSingle','id'=>$message->id));
	}
	public function actionRestore($id) {
		$message=Message::model()->findByPk($id);
		if (!$message->visible) {
			$message->visible=true;
			$message->save();
			$message->updateTagSummaries("add");
			if ($message->authorUser->visible) {
				Yii::app()->db->createCommand("
					UPDATE area SET message_count=message_count+1
					WHERE id IN(".(implode(',',$message->area->getParentIds(true))).")
				")->execute();
			}
		}
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
	
	public function actionMyComments() {
		if (!Yii::app()->user->model) {
			throw new CHttpException(400, 'You must be logged in to perform this action');
		}
		
		$userid=Yii::app()->user->model->id;
		$messageids=Yii::app()->db->createCommand("
			SELECT message.id
			FROM message JOIN comment ON comment.message_id=message.id AND (comment.visible>0 OR comment.author_user_id=$userid)
			             JOIN user ON message.author_user_id=user.id AND (user.visible>0 OR user.id=$userid)
			             JOIN area ON message.area_id=area.id AND area.visible>0
			WHERE message.visible>0 AND (message.author_user_id=$userid OR comment.author_user_id=$userid)
			GROUP BY message.id
			ORDER BY MAX(comment.date_time) DESC
			LIMIT 500
		")->queryColumn();
		
		$messages=array();
		if ($messageids) {
			$messageids=implode(',', $messageids);
			$criteria=new CDbCriteria(array(
				'condition'=>"t.id IN($messageids)",
				'order'=>"FIELD(t.id, $messageids)",
				'limit'=>100
			));
			
			$messages=Message::model()->findAll($criteria);
		}
		
		if (Yii::app()->request->isApiRequest) {
			echo Yii::app()->api->okResponse($messages, array());	
			Yii::app()->end();
		}
		else {
			// TODO: implement web version
			throw new CHttpException(400, 'This request is for API only');
		}
	}
	
	public function actionIndex()
	{
		if (Yii::app()->request->isAdminDomain) {
			$this->redirect(array('admin/index'));
			Yii::app()->end();
		}
		Utils::beginProfile("wholeAction","wholeAction");
		//if (Yii::app()->request->isMobile) $this->forward("viewMobile");
		$currentArea=$this->currentArea;
		$author=$this->selectedAuthor;
		
		$tags=isset($_GET['tags'])?$_GET['tags']:null;
		
		if (!Yii::app()->request->isApiRequest) {
			$showHiddenMessages=Yii::app()->user->checkAccess("ViewHiddenMessages",array('area'=>$currentArea));
		}
		else {
			$showHiddenMessages=false;
		}
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
		
		$dist=500;
		if (isset($_GET['dist'])) $dist=$_GET['dist'];
		
		
		$dist_init=null;
		$dist_max=null;
		$min_results=0;
		
		if (Yii::app()->request->isApiRequest && $lat!==null && $long!==null) {
			$dist_init=Yii::app()->settings->message_explore_initial_radius;
			$dist_max=Yii::app()->settings->message_explore_max_radius;
			$min_results=Yii::app()->settings->message_explore_min_results;
			
			if (isset($_REQUEST['dist_init']) && ($dist_init_r=intval($_REQUEST['dist_init']))>0) $dist_init=$dist_init_r;
			if (isset($_REQUEST['dist_max']) && ($dist_max_r=intval($_REQUEST['dist_max']))>0) $dist_init=$dist_max_r;
			if (isset($_REQUEST['min_results']) && ($min_results_r=intval($_REQUEST['min_results']))>0) $min_results=$min_results_r;
			
			$dist=$dist_init;
		}
		
		$criteria=Message::model()->createCommonCriteria(array(
			'showHidden'=>$showHiddenMessages, 
			'area'=>$currentArea, 
			'author'=>$author, 
			'tags'=>$tags,
			'isExpo'=>Yii::app()->user->isExpo,
			'isApi'=>Yii::app()->request->isApiRequest,
			'lat'=>$lat,
			'long'=>$long,
			'dist'=>$dist,
			'dist_init'=>$dist_init,
			'dist_max'=>$dist_max,
			'min_results'=>$min_results,
			'requester'=>Yii::app()->user->model,
			'testChannel'=>Yii::app()->request->testChannel
		)); 
		
		if (Yii::app()->request->isApiRequest) {
			$apiLabels=array(
			);
			
			$limit=Yii::app()->settings->message_index_default_limit_api;
			if (isset($_GET['limit'])) {
				$limit=intval($_GET['limit']);
				if ($limit<=0) $limit=null;
			}
			if (isset($limit)) {
				$criteria->limit=$limit;
			}
			
			$messages=Message::model()->with(array(
					'attachments', 
					'area'=>array(), 
					'tags'=>array(),  
					'authorUser'=>array(), 
					'tags.translation'.($curlangid=I::currentLanguage()->id), 
				))->findAll($criteria);
			echo Yii::app()->api->okResponse($messages, $apiLabels);
		
			Yii::app()->end();
			return;
		}
		
		$dates=array();
		
		Utils::ensureGlobalStateCacheDependency($statename="cachecheck.dates.".(($currentArea==null)?"global":"area".($currentArea->id)).(Yii::app()->user->isExpo?'.expo':''));
		$dep=new CGlobalStateCacheDependency($statename);
		$dates=Message::model()->cache(2592000,$dep)->getDates($criteria);
		
		
		if (isset($_GET['date']) && $_GET['date']!=='latest') $date=$_GET['date'];
		elseif (count($dates)>0) $date=$dates[0]; 
		else $date=false;
		
		if (Yii::app()->settings->message_index_dates_months_only) $date=implode("-",array_slice(explode("-", $date),0,2));
		
		$tagCloudMessageCriteria=clone $criteria;
			
		if ($date) {
			
			$datesplit=explode("-", $date);
			
			if (count($datesplit)>2 && $datesplit[2]>0) {
				$criteria->addCondition('DATE(t.date_time)=:date');
				$criteria->params[':date']=$date;
			}
			else {
				$criteria->addCondition('YEAR(t.date_time)=:year AND MONTH(t.date_time)=:month');
				$criteria->params[':year']=$datesplit[0];
				$criteria->params[':month']=$datesplit[1];
			}
		
			
			$onComments=array(); //no longer used?
			$commentsparams=array('scopes'=>array('orderByDate'));
			
			if (!Yii::app()->user->checkAccess('ViewHiddenComments', array('area'=>$currentArea))) {
				$commentsparams['scopes'][]='onlyVisible';
			}
			
			$with=array(
					'attachments', 
					'tags.translation'.($curlangid=I::currentLanguage()->id), 
					'area'=>array(), 
					'tags'=>array(), 
					
			);
			if (!Yii::app()->user->isExpo) {
				$with['comments']=$commentsparams;
				$with['comments.authorUser']=array('alias'=>'commentsAuthorUser'); 
			}
			
		}
		else {
			//Yii::trace('Latest message date is null');
			$criteria=null;
			$with=null;
		}
		
		
		
		
		$this->registerScriptGoToDate();
		
		$this->initBreadcrumbs();
		
		if (isset($_GET['tags']) && ($tag=Tag::get((int)($_GET['tags'])))!=null) {
			if (!$this->selectedAuthor) {
				$this->breadcrumbs[I::t('menu.tags')]=array(
					'tag/index',
					'in'=>$this->currentArea
				);
			}
			$this->breadcrumbs[0]="#".$tag->asString;
		}
		
		if ($this->selectedAuthor) {
			$this->breadcrumbs[I::t('menu.participants')]=array(
				'user/index',
				'in'=>$this->currentArea
			);
			if (!isset($_GET['tags']) || $tag==null) {
				$this->breadcrumbs[0]=$this->selectedAuthor->getActualDisplayName();
			}
			else {
				$this->breadcrumbs[$this->selectedAuthor->getActualDisplayName()]=array(
					'message/index',
					'in'=>$this->currentArea,
					'author_id'=>$this->selectedAuthor->id
				);
			}
		}
		
		if (!isset($this->breadcrumbs[0])) {
			$this->breadcrumbs[0]=I::t('menu.global_message_index');
		}
		
		$this->fixBreadcrumbs();
	
	
	
		Utils::beginProfile("renderView","renderView");
		
		
		if (Yii::app()->user->isExpo && Yii::app()->request->isAjaxRequest) $render='renderPartial';
		else $render='render';
		
		
		$this->$render('index',array(
			'criteria'=>$criteria,
			'with'=>$with,
			'tagCloudMessageCriteria'=>$tagCloudMessageCriteria,
			'author'=>$author,
			'dates'=>$dates,
			'date'=>$date,
			'tags'=>$tags,
			'canEdit'=>Yii::app()->user->checkAccess('EditMessage', array('area'=>$this->currentArea)),
			'canHide'=>Yii::app()->user->checkAccess('HideMessage', array('area'=>$this->currentArea)),
			'canDelete'=>Yii::app()->user->checkAccess('DeleteMessage', array('area'=>$this->currentArea)),
			'canEditOwn'=>($isnotguest=!Yii::app()->user->isGuest),
			'canHideOwn'=>$isnotguest,
			'canPostComments'=>Yii::app()->user->checkAccess('PostComment'),
			'canHideComments'=>Yii::app()->user->checkAccess('HideComment', array('area'=>$this->currentArea)),
			'canCopyToEditorial'=>($this->currentArea!=null && 
									$this->currentArea->type!=Area::TYPE_EDITORIAL &&
									$this->currentArea->type!=Area::TYPE_FORUM && 
									($ed=$this->currentArea->editorial)!=null &&
									$ed->visible &&
									Yii::app()->user->checkAccess('Publish', array('area'=>$ed))
			),
		));
		Utils::endProfile("renderView","renderView");
		Utils::endProfile("wholeAction","wholeAction");
	}
	
	public function actionViewSingle($id) {
		$message=Message::model()->findByPk($id);
		$this->layout='//layouts/empty';
		$canViewHidden=Yii::app()->user->checkAccess("ViewHiddenMessages",array('area'=>$this->currentArea));
		if ($message->visible || $canViewHidden || (($testchannel=Yii::app()->request->testChannel) && $testchannel==$message->authorUser->testChannel)) {
			$this->render('_view', array(
				'message'=>$message,
				'canEditMessage'=>(Yii::app()->user->checkAccess('EditMessage', array('area'=>$this->currentArea)) ||
									Yii::app()->user->checkAccess('EditOwnMessage', array('message'=>$message))),
				'canHideMessage'=>(Yii::app()->user->checkAccess('HideMessage', array('area'=>$this->currentArea)) ||
									Yii::app()->user->checkAccess('HideOwnMessage', array('message'=>$message))),
				'canDeleteMessage'=>(Yii::app()->user->checkAccess('DeleteMessage', array('area'=>$this->currentArea)) ||
									Yii::app()->user->checkAccess('DeleteOwnMessage', array('message'=>$message))),
				'afterEdit'=>true,
				'canHideOwn'=>!Yii::app()->user->isGuest,
				'canPostComments'=>Yii::app()->user->checkAccess('PostComment'),
				'canHideComments'=>Yii::app()->user->checkAccess('HideComment', array('area'=>$message->area)),
				'canCopyToEditorial'=>($message->area->type!=Area::TYPE_EDITORIAL &&
										$message->area->type!=Area::TYPE_FORUM && 
										($ed=$message->area->editorial)!=null &&
										Yii::app()->user->checkAccess('Publish', array('area'=>$ed))
				),
			
			));
		}
	}
	
	/*public function actionViewMobile() {
		if (isset($_GET['id']))
	}*/
	
	public function actionMove() { // DEPRECATED!!
		$destination_area_id=intval($_POST['destination_area_id']);
		if (!$destination_area_id) throw new CHttpException(400);
		$destinationArea=Area::get($destination_area_id);
		if (!$destinationArea) throw new CHttpException(400);
		$message_ids=explode(",", $_POST['message_ids']);
		if ($message_ids==array()) throw new CHttpException(400);
		$messages=Message::model()->findAllByPk($message_ids);
		if ($messages==array()) throw new CHttpException(400);
		foreach ($messages as $message) {
			$message->move($destinationArea);
		}
		//echo "Return URL: ".Yii::app()->user->returnUrl;
		$this->redirect(Yii::app()->user->returnUrl);
	}
	
	public function getSelectedAuthor() {
		if ($this->_selectedAuthor===false) {
			//if (!$this->currentArea) $author=null;
			//else {
				if (isset($_GET['author_id'])) {
					if (is_numeric($authorid=$_GET['author_id']))
						$author=User::model()->findByPk($authorid);
					else $author=User::model()->findByAttributes(array('username'=>$authorid)); //, 'current_area_id'=>$this->currentArea->id));
				}
				else $author=null;
			//}
			$this->_selectedAuthor=$author;
		}
		return $this->_selectedAuthor;
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
	
	public function actionPostComment() {
		$comment=new Comment();
		$comment->attributes=$_POST['Comment'];
		
		$this->layout='//layouts/empty';
		
		if(isset($_POST['ajax']) && strpos($_POST['ajax'],'comment-form')===0)
		{
			echo CActiveForm::validate($comment);
			Yii::app()->end();
		}
		
		$uploadedfiles=CUploadedFile::getInstances($comment,'files');
		
		if ($comment->save(true)) {
			$notifyImmediately=true;
			if (count($uploadedfiles)>0) {
				$uploadedFile=$uploadedfiles[0];
				if ($uploadedFile->size>0) {
					Yii::trace('Saving uploaded audio file for comment: '.$uploadedFile->name.' ('.$uploadedFile->tempName.' size: '.$uploadedFile->size.' error: '.$uploadedFile->error.')');
					try {
						    $tmpfile='/tmp/upload.'.$uploadedFile->extensionName;
						    if (!$uploadedFile->saveAs($tmpfile,false)) {
						            throw new CException('Could not write temporary file');
						    }
						    
						$filepath=$comment->generateAudioFileName($uploadedFile->extensionName);
						Yii::trace("  File path will be: $filepath");
						@$ok=$uploadedFile->saveAs(Yii::getPathOfAlias("webroot.uploads")."/".$filepath,false);
						if (!$ok) throw new CException('copy failed');
						$comment->audio_filename=$filepath;
						if (empty($comment->text)) {
							$comment->visible=0;
							$notifyImmediately=false;	
						}
						$comment->pending=1;
						$comment->save(false);
					
			
					}
					catch (Exception $e) {
						Yii::log('Failed to save uploaded audio file for comment. '.$e->getTraceAsString(),'error');
						Attachment::saveFailedUpload($uploadedFile);
						throw $e;
					}
				}
				else {
					Yii::trace('Ignoring 0-size file uploaded with comment: '.$uploadedFile->name);
				}
				
				
				
				
						
			}
		
		
			if ($notifyImmediately) $comment->sendEmailNotification();
			$comment=Comment::model()->findByPk($comment->id);
			$commentAuthor=$comment->authorUser;
			if (Yii::app()->request->isApiRequest) {
				echo Yii::app()->api->okResponse($comment->message);
				Yii::app()->end();
			}
			else {
				$this->renderPartial('_comment', array(
					'comment'=>$comment, 
					'commentAuthor'=>$commentAuthor,
					'canHideComment'=>Yii::app()->user->checkAccess('HideOwnComment', array('comment'=>$comment))
				));
			}
		}
		else {
			if (Yii::app()->request->isApiRequest) {
				echo Yii::app()->api->errorResponse($comment);
			}
			else echo CHtml::errorSummary($comment); //TODO: better response
		}
	}
	
	public function actionHideComment($comment_id) {
		$this->layout='//layouts/empty';
		$comment=Comment::model()->findByPk($comment_id);
		$comment->visible=false;
		if (!$comment->save(false)) echo "ERROR!!!";
	}


	// TODO 
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
	
	// TODO: obsolete/unused?
	public function actionProcessAttachments($messageId, $secret='') {
		if (!Yii::app()->user->checkAccess('ProcessAttachments') && $secret!=Yii::app()->params['adminPassword']) {
			throw new CHttpException(403,'Unauthorized');
		}
		Message::model()->findByPk($messageId)->processAttachments();
		echo "done";
		//$this->redirect(array('message/view','id'=>$messageId));
	}
	
	public function actionEnableSearch() {
		$key=Yii::app()->user->getState('searchkey');
		if (!$key) {
			$key=Yii::app()->user->generateSearchKey();
		}
		echo $key;
	}
	
	public function actionSearch() {
		$searchForm=new MessageSearchForm(Yii::app()->user->isGuest?'guest':'');
		if (isset($_POST['MessageSearchForm'])) {
			Yii::trace("(Message Search) POST: ".print_r($_POST,true));
			$searchForm->attributes=$_POST['MessageSearchForm'];
			if(isset($_POST['ajax']) && strpos($_POST['ajax'],'message-search-form')===0) {
				echo CActiveForm::validate($searchForm);
				Yii::app()->end();
			}
			//if (isset($_GET['debug7777'])) die($searchForm->scenario);
			if ($searchForm->validate()) {
				$searchForm->prepare(array(
					'showHidden'=>Yii::app()->user->checkAccess('SuperUser'),
					'requesterUser'=>Yii::app()->user->model,
					'testChannel'=>Yii::app()->request->testChannel
				)); 
				$this->redirect(array('message/results', 'search_id'=>$searchForm->searchId));
				Yii::app()->end();
			}
		}
		$this->initBreadcrumbs();

		$this->breadcrumbs[0]=I::t('menu.search');
		
		$this->render('search', array('searchForm'=>$searchForm), false, true);
	}
	
	public function actionResults($search_id, $page=0) {
		$searchForm=Yii::app()->user->getState("search$search_id");
		if ($searchForm) {
			$count=Yii::app()->db->createCommand($searchForm->countDBQuery)->queryScalar();
		
			$resultsperpage=Yii::app()->settings->search_results_per_page;
			if (Yii::app()->request->isApiRequest) {
				$resultsperpage=Yii::app()->settings->search_results_per_page_API;
			}
		
			$offset=$page*$resultsperpage;
			if ($offset>=$count) $messages=array();
			else {
				$query=$searchForm->searchDBQuery." LIMIT $offset,$resultsperpage";
				$messageIds=Yii::app()->db->createCommand($query)->queryColumn();
				if ($messageIds==array()) $messages=array();
				else {
					$criteria=new CDbCriteria(array(
						'order'=>'date_time DESC, t.id DESC',
						'with'=>array('authorUser', 'area'),
						'together'=>true
					));
					$messages=Message::model()->findAllByPk($messageIds,$criteria);
				}
			}
		
			if (Yii::app()->request->isApiRequest) {
				if (isset($searchForm->latitude) && $searchForm->latitude!=0 && isset($searchForm->longitude) && $searchForm->longitude!=0) {
					$dist_init=Yii::app()->settings->message_explore_initial_radius;
					$dist_max=Yii::app()->settings->message_explore_max_radius;
					$min_results=Yii::app()->settings->message_explore_min_results;
			
					if (isset($_REQUEST['dist_init']) && ($dist_init_r=intval($_REQUEST['dist_init']))>0) $dist_init=$dist_init_r;
					if (isset($_REQUEST['dist_max']) && ($dist_max_r=intval($_REQUEST['dist_max']))>0) $dist_init=$dist_max_r;
					if (isset($_REQUEST['min_results']) && ($min_results_r=intval($_REQUEST['min_results']))>0) $min_results=$min_results_r;
			
					$dist=$dist_init;
				
					$criteria2=Message::model()->createCommonCriteria(array(
						'showHidden'=>false, 
						'area'=>null, 
						'author'=>null, 
						'tags'=>'',
						'isExpo'=>false,
						'isApi'=>true,
						'lat'=>$searchForm->latitude,
						'long'=>$searchForm->longitude,
						'dist'=>$dist,
						'dist_init'=>$dist_init,
						'dist_max'=>$dist_max,
						'min_results'=>$min_results,
						'requester'=>Yii::app()->user->model,
						'testChannel'=>Yii::app()->request->testChannel
					)); 
				
					$messages2=Message::model()->with(array(
						'attachments', 
						'area', 
						'tags', 
						'authorUser'=>array(), 
						'tags.translation'.($curlangid=I::currentLanguage()->id),
					))->findAll($criteria2);
				
					$messages=array_merge($messages, $messages2);
				
					$byid=array();
					for ($i=0; $i<count($messages); $i++) {
						if (isset($byid[$messages[$i]->id])) {
							array_splice($messages, $i, 1);
							$i--;
						}
						else {
							$byid[$messages[$i]->id]=true;
						}
					}
				} 
		
				echo Yii::app()->api->okResponse($messages, array(), true, true, 'data', array(
					'paginationInfo'=>array(
						'totalItems'=>$count,
						'itemsPerPage'=>$resultsperpage,
						'currentPage'=>$page,
						'totalPages'=>ceil($count/$resultsperpage)
					)
				));
			}
			else {
		
				$this->initBreadcrumbs();
				
				$this->breadcrumbs[I::t('menu.search')]=array(
					'message/search',
					'in'=>$this->currentArea,
				);
				$this->breadcrumbs[0]=$searchForm->q;
		
				$this->render('results', array(
					'searchForm'=>$searchForm, 
					'messages'=>$messages,
					'totalMessages'=>$count,
					'currentPage'=>$page,
				));
			}
		}
		else {
			$message=I::t('search.error.expired', null, array('{BACK_LINK}'=>'javascript:window.history.back();'));
			if (Yii::app()->request->isApiRequest) $message=strip_tags($message);
			throw new HttpException(400, $message, 0, false);
			
		}	
		
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
