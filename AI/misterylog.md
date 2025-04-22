2025/04/22 20:36:32 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /tag/proposed [141.101.76.103] === 
2025/04/22 20:36:32 [info] [application] POST:
2025/04/22 20:36:32 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:36:32 [info] [application]  === END REQUEST: /tag/proposed [ok] [200] === 
2025/04/22 20:36:33 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/publish [104.23.166.50] === 
2025/04/22 20:36:33 [info] [application] POST:
2025/04/22 20:36:33 [info] [application]     [PublishForm] => Array
2025/04/22 20:36:33 [info] [application]             [longitude] => -0.6568263
2025/04/22 20:36:33 [info] [application]             [latitude] => 38.0119923
2025/04/22 20:36:33 [info] [application]             [address] => C. Mimosas, 15, 03188 Torrevieja, Alicante, España
2025/04/22 20:36:33 [info] [application]             [text] => 
2025/04/22 20:36:33 [info] [application]             [newtags] => 
2025/04/22 20:36:33 [info] [application]             [device] => android
2025/04/22 20:36:33 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:36:33 [warning] [translations] Missing English translation for validators.length.toolong
2025/04/22 20:36:33 [info] [application] Tagger integration starting. useTagger flag: true
2025/04/22 20:36:33 [info] [application] Message has 1 attachments, looking for audio files
2025/04/22 20:36:33 [info] [application] Checking attachment ID: 88562, type: 2
2025/04/22 20:36:33 [info] [application] Found audio attachment, path: /srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71818_a88562_audio.amr
2025/04/22 20:36:33 [info] [application] Tagger script permissions: 100755, executable: yes
2025/04/22 20:36:33 [info] [application] Executing Tagger command: /srv/www/blind.wiki/public_html/Tagger/run_tagger.sh '/srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71818_a88562_audio.amr'
2025/04/22 20:36:47 [info] [application] Tagger execution completed in 14.05 seconds with exit code: 1
2025/04/22 20:36:47 [info] [application] Tagger output START
2025/04/22 20:36:47 [info] [application] Tagger output line 1: /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/transformers/utils/hub.py:124: FutureWarning: Using `TRANSFORMERS_CACHE` is deprecated and will be removed in v5 of Transformers. Use `HF_HOME` instead.
2025/04/22 20:36:47 [info] [application] Tagger output line 2:   warnings.warn(
2025/04/22 20:36:47 [info] [application] Tagger output line 3: /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/huggingface_hub/file_download.py:896: FutureWarning: `resume_download` is deprecated and will be removed in version 1.0.0. Downloads always resume when possible. If you want to force a new download, use `force_download=True`.
2025/04/22 20:36:47 [info] [application] Tagger output line 4:   warnings.warn(
2025/04/22 20:36:47 [info] [application] Tagger output line 5: Traceback (most recent call last):
2025/04/22 20:36:47 [info] [application] Tagger output line 6:   File "<frozen runpy>", line 198, in _run_module_as_main
2025/04/22 20:36:47 [info] [application] Tagger output line 7:   File "<frozen runpy>", line 88, in _run_code
2025/04/22 20:36:47 [info] [application] Tagger output line 8:   File "/srv/www/blind.wiki/public_html/Tagger/main.py", line 124, in <module>
2025/04/22 20:36:47 [info] [application] Tagger output line 9:     main()
2025/04/22 20:36:47 [info] [application] Tagger output line 10:     ^^^^^^
2025/04/22 20:36:47 [info] [application] Tagger output line 11:   File "/srv/www/blind.wiki/public_html/Tagger/main.py", line 97, in main
2025/04/22 20:36:47 [info] [application] Tagger output line 12:     raise FileNotFoundError(f"El archivo de audio {args.audio_file} no existe")
2025/04/22 20:36:47 [info] [application] Tagger output line 13: FileNotFoundError: El archivo de audio /srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71818_a88562_audio.amr no existe
2025/04/22 20:36:47 [info] [application] Tagger output line 14: Cargando modelo de embeddings: paraphrase-multilingual-mpnet-base-v2...
2025/04/22 20:36:47 [info] [application] Tagger output line 15: Cargando modelo ASR: openai/whisper-small...
2025/04/22 20:36:47 [info] [application] Tagger output line 16: Device set to use cpu
2025/04/22 20:36:47 [info] [application] Tagger output line 17: Usando dispositivo: cpu
2025/04/22 20:36:47 [info] [application] Tagger output line 18: Se cargaron 16 etiquetas desde 16tags.txt
2025/04/22 20:36:47 [info] [application] Tagger output line 19: Cargando embeddings existentes desde /srv/www/blind.wiki/public_html/Tagger/embeddings/16tags_text_paraphrase-multilingual-mpnet-base-v2_embeddings.npz
2025/04/22 20:36:47 [info] [application] Tagger output line 20: Método de selección de etiquetas: adaptive
2025/04/22 20:36:47 [info] [application] Tagger output END
2025/04/22 20:36:47 [info] [application] Tagger complete output (pipe-separated): /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/transformers/utils/hub.py:124: FutureWarning: Using `TRANSFORMERS_CACHE` is deprecated and will be removed in v5 of Transformers. Use `HF_HOME` instead. |   warnings.warn( | /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/huggingface_hub/file_download.py:896: FutureWarning: `resume_download` is deprecated and will be removed in version 1.0.0. Downloads always resume when possible. If you want to force a new download, use `force_download=True`. |   warnings.warn( | Traceback (most recent call last): |   File "<frozen runpy>", line 198, in _run_module_as_main |   File "<frozen runpy>", line 88, in _run_code |   File "/srv/www/blind.wiki/public_html/Tagger/main.py", line 124, in <module> |     main() |     ^^^^^^ |   File "/srv/www/blind.wiki/public_html/Tagger/main.py", line 97, in main |     raise FileNotFoundError(f"El archivo de audio {args.audio_file} no existe") | FileNotFoundError: El archivo de audio /srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71818_a88562_audio.amr no existe | Cargando modelo de embeddings: paraphrase-multilingual-mpnet-base-v2... | Cargando modelo ASR: openai/whisper-small... | Device set to use cpu | Usando dispositivo: cpu | Se cargaron 16 etiquetas desde 16tags.txt | Cargando embeddings existentes desde /srv/www/blind.wiki/public_html/Tagger/embeddings/16tags_text_paraphrase-multilingual-mpnet-base-v2_embeddings.npz | Método de selección de etiquetas: adaptive
2025/04/22 20:36:47 [error] [application] Error executing Tagger (code: 1) - See output above
2025/04/22 20:36:47 [error] [application] SUGGESTION: Verify the Tagger script manually by running the following command on the server:
2025/04/22 20:36:47 [error] [application] cd /srv/www/blind.wiki/public_html && ./Tagger/run_tagger.sh '/srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71818_a88562_audio.amr'
2025/04/22 20:36:47 [error] [application] Check for Python dependencies and environment setup
2025/04/22 20:36:47 [info] [application] Tagger execution completed, processing results
2025/04/22 20:36:47 [info] [application] Tagger returned empty tags array
2025/04/22 20:36:47 [info] [application] Processing complete for first audio attachment
2025/04/22 20:36:47 [info] [application]  === END REQUEST: /message/publish [ok] [200] === 
2025/04/22 20:36:52 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /message/index?PHPSESSID=l9sdpoc5520soduvssohjhb5d0&author_id=5897 [172.71.95.142] === 
2025/04/22 20:36:52 [info] [application]  === END REQUEST: /message/index?PHPSESSID=l9sdpoc5520soduvssohjhb5d0&author_id=5897 [ok] [200] === 
2025/04/22 20:36:56 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /attachment/play/88561 [104.23.166.167] === 
2025/04/22 20:36:56 [info] [application]  === END REQUEST: /attachment/play/88561 [ok] [200] === 
2025/04/22 20:36:57 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /attachment/play/88561 [172.71.95.31] === 
2025/04/22 20:36:57 [info] [application]  === END REQUEST: /attachment/play/88561 [ok] [200] === 
2025/04/22 20:37:05 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /attachment/play/88562 [141.101.76.91] === 
2025/04/22 20:37:05 [info] [application]  === END REQUEST: /attachment/play/88562 [ok] [200] === 
2025/04/22 20:37:25 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /tag/proposed [104.23.166.90] === 
2025/04/22 20:37:25 [info] [application] POST:
2025/04/22 20:37:25 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:37:25 [info] [application]  === END REQUEST: /tag/proposed [ok] [200] === 
2025/04/22 20:37:27 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/publish [141.101.76.91] === 
2025/04/22 20:37:27 [info] [application] POST:
2025/04/22 20:37:27 [info] [application]     [PublishForm] => Array
2025/04/22 20:37:27 [info] [application]             [longitude] => -0.6568437
2025/04/22 20:37:27 [info] [application]             [latitude] => 38.0120091
2025/04/22 20:37:27 [info] [application]             [address] => C. Mimosas, 15, 03188 Torrevieja, Alicante, España
2025/04/22 20:37:27 [info] [application]             [text] => 
2025/04/22 20:37:27 [info] [application]             [newtags] => 
2025/04/22 20:37:27 [info] [application]             [device] => android
2025/04/22 20:37:27 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:37:27 [warning] [translations] Missing English translation for validators.length.toolong
2025/04/22 20:37:27 [info] [application] Tagger integration starting. useTagger flag: true
2025/04/22 20:37:27 [info] [application] Message has 1 attachments, looking for audio files
2025/04/22 20:37:27 [info] [application] Checking attachment ID: 88563, type: 2
2025/04/22 20:37:27 [info] [application] Found audio attachment, path: /srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71819_a88563_audio.amr
2025/04/22 20:37:27 [info] [application] Tagger script permissions: 100755, executable: yes
2025/04/22 20:37:27 [info] [application] Executing Tagger command: /srv/www/blind.wiki/public_html/Tagger/run_tagger.sh '/srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71819_a88563_audio.amr'
2025/04/22 20:37:51 [info] [application] Tagger execution completed in 23.71 seconds with exit code: 0
2025/04/22 20:37:51 [info] [application] Tagger output START
2025/04/22 20:37:51 [info] [application] Tagger output line 1: /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/transformers/utils/hub.py:124: FutureWarning: Using `TRANSFORMERS_CACHE` is deprecated and will be removed in v5 of Transformers. Use `HF_HOME` instead.
2025/04/22 20:37:51 [info] [application] Tagger output line 2:   warnings.warn(
2025/04/22 20:37:51 [info] [application] Tagger output line 3: /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/huggingface_hub/file_download.py:896: FutureWarning: `resume_download` is deprecated and will be removed in version 1.0.0. Downloads always resume when possible. If you want to force a new download, use `force_download=True`.
2025/04/22 20:37:51 [info] [application] Tagger output line 4:   warnings.warn(
2025/04/22 20:37:51 [info] [application] Tagger output line 5: Cargando modelo de embeddings: paraphrase-multilingual-mpnet-base-v2...
2025/04/22 20:37:51 [info] [application] Tagger output line 6: Cargando modelo ASR: openai/whisper-small...
2025/04/22 20:37:51 [info] [application] Tagger output line 7: Device set to use cpu
2025/04/22 20:37:51 [info] [application] Tagger output line 8: Usando dispositivo: cpu
2025/04/22 20:37:51 [info] [application] Tagger output line 9: Se cargaron 16 etiquetas desde 16tags.txt
2025/04/22 20:37:51 [info] [application] Tagger output line 10: Cargando embeddings existentes desde /srv/www/blind.wiki/public_html/Tagger/embeddings/16tags_text_paraphrase-multilingual-mpnet-base-v2_embeddings.npz
2025/04/22 20:37:51 [info] [application] Tagger output line 11: Método de selección de etiquetas: adaptive
2025/04/22 20:37:51 [info] [application] Tagger output line 12: Transcribiendo audio: /srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71819_a88563_audio.amr
2025/04/22 20:37:51 [info] [application] Tagger output line 13: Resultado guardado en /srv/www/blind.wiki/public_html/Tagger/output/torrevieja_Blas_m71819_a88563_audio_text_adaptive.json.
2025/04/22 20:37:51 [info] [application] Tagger output line 14: 
2025/04/22 20:37:51 [info] [application] Tagger output line 15: Resultado:
2025/04/22 20:37:51 [info] [application] Tagger output line 16:  {
2025/04/22 20:37:51 [info] [application] Tagger output line 17:   "file": "torrevieja_Blas_m71819_a88563_audio.amr",
2025/04/22 20:37:51 [info] [application] Tagger output line 18:   "transcription": " Hello, we are here at the bar and it is accessible and has good accessibility.",
2025/04/22 20:37:51 [info] [application] Tagger output line 19:   "tags": [
2025/04/22 20:37:51 [info] [application] Tagger output line 20:     {
2025/04/22 20:37:51 [info] [application] Tagger output line 21:       "tag": "bar",
2025/04/22 20:37:51 [info] [application] Tagger output line 22:       "similarity": 0.6441854238510132
2025/04/22 20:37:51 [info] [application] Tagger output line 23:     }
2025/04/22 20:37:51 [info] [application] Tagger output line 24:   ]
2025/04/22 20:37:51 [info] [application] Tagger output line 25: }
2025/04/22 20:37:51 [info] [application] Tagger output END
2025/04/22 20:37:51 [info] [application] Tagger complete output (pipe-separated): /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/transformers/utils/hub.py:124: FutureWarning: Using `TRANSFORMERS_CACHE` is deprecated and will be removed in v5 of Transformers. Use `HF_HOME` instead. |   warnings.warn( | /srv/www/blind.wiki/public_html/.venv/lib/python3.12/site-packages/huggingface_hub/file_download.py:896: FutureWarning: `resume_download` is deprecated and will be removed in version 1.0.0. Downloads always resume when possible. If you want to force a new download, use `force_download=True`. |   warnings.warn( | Cargando modelo de embeddings: paraphrase-multilingual-mpnet-base-v2... | Cargando modelo ASR: openai/whisper-small... | Device set to use cpu | Usando dispositivo: cpu | Se cargaron 16 etiquetas desde 16tags.txt | Cargando embeddings existentes desde /srv/www/blind.wiki/public_html/Tagger/embeddings/16tags_text_paraphrase-multilingual-mpnet-base-v2_embeddings.npz | Método de selección de etiquetas: adaptive | Transcribiendo audio: /srv/www/blind.wiki/public_html/uploads/torrevieja_Blas_m71819_a88563_audio.amr | Resultado guardado en /srv/www/blind.wiki/public_html/Tagger/output/torrevieja_Blas_m71819_a88563_audio_text_adaptive.json. |  | Resultado: |  { |   "file": "torrevieja_Blas_m71819_a88563_audio.amr", |   "transcription": " Hello, we are here at the bar and it is accessible and has good accessibility.", |   "tags": [ |     { |       "tag": "bar", |       "similarity": 0.6441854238510132 |     } |   ] | }
2025/04/22 20:37:51 [info] [application] Processing console output from Tagger
2025/04/22 20:37:51 [info] [application] Extraction completed. Transcription:  Hello, we are here at the bar and it is accessibl... Tags: 1
2025/04/22 20:37:51 [info] [application] Tagger execution completed, processing results
2025/04/22 20:37:51 [info] [application] Adding 1 tags to message: bar
2025/04/22 20:37:51 [info] [application] Tagger: tags added to message 71819: bar
2025/04/22 20:37:51 [info] [application] Processing complete for first audio attachment
2025/04/22 20:37:51 [info] [application]  === END REQUEST: /message/publish [ok] [200] === 
2025/04/22 20:37:54 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /message/index?PHPSESSID=l9sdpoc5520soduvssohjhb5d0&author_id=5897 [104.23.170.12] === 
2025/04/22 20:37:55 [info] [application]  === END REQUEST: /message/index?PHPSESSID=l9sdpoc5520soduvssohjhb5d0&author_id=5897 [ok] [200] === 
2025/04/22 20:41:48 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] /site/index [141.101.76.72] === 
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for about.common.creator
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for about.common.developer_web_android
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for about.common.developer_iphone
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for about.common.supported_by
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for about.common.thanks
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for about.common.project_coordination
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for general.count_participants
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for general.count_messages
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for global.title
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for _action.site/index
2025/04/22 20:41:48 [warning] [translations] Missing English translation for _action.site/index
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for _label.messagesearchform.q
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for eyefree.nav.contentlink
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.home
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.places
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.global_message_index
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.participants
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.search
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.more
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for video.title
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.social
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.support
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for terms.title
2025/04/22 20:41:48 [warning] [translations] Missing 中文 translation for menu.contact
2025/04/22 20:41:48 [info] [application]  === END REQUEST: /site/index [200] === 
2025/04/22 20:41:59 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] /area523/message/index?lang=10&in=523 [172.71.95.34] === 
2025/04/22 20:41:59 [warning] [translations] Missing Italiano translation for general.message.text_hidden
2025/04/22 20:41:59 [warning] [translations] Missing Italiano translation for _action.message/index
2025/04/22 20:41:59 [warning] [translations] Missing English translation for _action.message/index
2025/04/22 20:41:59 [warning] [translations] Missing Italiano translation for menu.more
2025/04/22 20:41:59 [warning] [translations] Missing Italiano translation for video.title
2025/04/22 20:41:59 [warning] [translations] Missing Italiano translation for menu.social
2025/04/22 20:41:59 [warning] [translations] Missing Italiano translation for menu.contact
2025/04/22 20:41:59 [info] [application]  === END REQUEST: /area523/message/index?lang=10&in=523 [200] === 
2025/04/22 20:43:45 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] / [172.71.99.96] === 
2025/04/22 20:43:45 [warning] [translations] Missing English translation for _action.site/index
2025/04/22 20:43:45 [info] [application]  === END REQUEST: / [200] === 
2025/04/22 20:48:00 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] /area523/map/index [172.70.46.170] === 
2025/04/22 20:48:00 [info] [application]  === END REQUEST: /area523/map/index [200] === 
2025/04/22 20:48:07 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /tag/proposed [172.71.102.54] === 
2025/04/22 20:48:07 [info] [application] POST:
2025/04/22 20:48:07 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:48:07 [info] [application]  === END REQUEST: /tag/proposed [ok] [200] === 
2025/04/22 20:48:11 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/publish [172.70.46.98] === 
2025/04/22 20:48:11 [info] [application] POST:
2025/04/22 20:48:11 [info] [application]     [PublishForm] => Array
2025/04/22 20:48:11 [info] [application]             [longitude] => -0.6568416
2025/04/22 20:48:11 [info] [application]             [latitude] => 38.0120001
2025/04/22 20:48:11 [info] [application]             [address] => C. Mimosas, 15, 03188 Torrevieja, Alicante, España
2025/04/22 20:48:11 [info] [application]             [text] => 
2025/04/22 20:48:11 [info] [application]             [newtags] => 
2025/04/22 20:48:11 [info] [application]             [device] => android
2025/04/22 20:48:11 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:48:11 [warning] [translations] Missing English translation for validators.length.toolong
2025/04/22 20:48:11 [info] [application] Tagger integration starting. useTagger flag: false
2025/04/22 20:48:11 [info] [application] Skipping Tagger integration: useTagger=false, attachment count=1
2025/04/22 20:48:11 [info] [application]  === END REQUEST: /message/publish [ok] [200] === 
2025/04/22 20:48:15 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /tag/proposed [172.70.47.102] === 
2025/04/22 20:48:15 [info] [application] POST:
2025/04/22 20:48:15 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:48:15 [info] [application]  === END REQUEST: /tag/proposed [ok] [200] === 
2025/04/22 20:48:16 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/publish [172.71.103.78] === 
2025/04/22 20:48:16 [info] [application] POST:
2025/04/22 20:48:16 [info] [application]     [PublishForm] => Array
2025/04/22 20:48:16 [info] [application]             [longitude] => -0.6568458
2025/04/22 20:48:16 [info] [application]             [latitude] => 38.0120055
2025/04/22 20:48:16 [info] [application]             [address] => C. Mimosas, 15, 03188 Torrevieja, Alicante, España
2025/04/22 20:48:16 [info] [application]             [text] => 
2025/04/22 20:48:16 [info] [application]             [newtags] => 
2025/04/22 20:48:16 [info] [application]             [device] => android
2025/04/22 20:48:16 [info] [application]     [PHPSESSID] => l9sdpoc5520soduvssohjhb5d0
2025/04/22 20:48:16 [warning] [translations] Missing English translation for validators.length.toolong
2025/04/22 20:48:16 [info] [application] Tagger integration starting. useTagger flag: false
2025/04/22 20:48:16 [info] [application] Skipping Tagger integration: useTagger=false, attachment count=1
2025/04/22 20:48:16 [info] [application]  === END REQUEST: /message/publish [ok] [200] === 
2025/04/22 20:48:26 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /message/index?author_id=5897&PHPSESSID=10549lrqrenb33of28oh3bkmf3 [172.71.102.54] === 
2025/04/22 20:48:26 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:26 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:26 [info] [application]  === END REQUEST: /message/index?author_id=5897&PHPSESSID=10549lrqrenb33of28oh3bkmf3 [ok] [200] === 
2025/04/22 20:48:26 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /message/index?author_id=5897&PHPSESSID=10549lrqrenb33of28oh3bkmf3 [172.71.182.53] === 
2025/04/22 20:48:26 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:26 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:26 [info] [application]  === END REQUEST: /message/index?author_id=5897&PHPSESSID=10549lrqrenb33of28oh3bkmf3 [ok] [200] === 
2025/04/22 20:48:26 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /message/index?author_id=5897&PHPSESSID=10549lrqrenb33of28oh3bkmf3 [104.23.166.50] === 
2025/04/22 20:48:26 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:26 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:26 [info] [application]  === END REQUEST: /message/index?author_id=5897&PHPSESSID=10549lrqrenb33of28oh3bkmf3 [ok] [200] === 
2025/04/22 20:48:28 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /attachment/play/88565?PHPSESSID=10549lrqrenb33of28oh3bkmf3 [104.23.168.44] === 
2025/04/22 20:48:28 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:28 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:28 [info] [application]  === END REQUEST: /attachment/play/88565?PHPSESSID=10549lrqrenb33of28oh3bkmf3 [ok] [200] === 
2025/04/22 20:48:32 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/hide/71821 [172.71.102.55] === 
2025/04/22 20:48:32 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:32 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:32 [info] [application] POST:
2025/04/22 20:48:32 [info] [application]     [PHPSESSID] => 10549lrqrenb33of28oh3bkmf3
2025/04/22 20:48:32 [info] [application]  === END REQUEST: /message/hide/71821 [ok] [200] === 
2025/04/22 20:48:35 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/hide/71820 [104.23.170.40] === 
2025/04/22 20:48:35 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:35 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:35 [info] [application] POST:
2025/04/22 20:48:35 [info] [application]     [PHPSESSID] => 10549lrqrenb33of28oh3bkmf3
2025/04/22 20:48:35 [warning] [translations] Missing English translation for validators.length.toolong
2025/04/22 20:48:35 [info] [application]  === END REQUEST: /message/hide/71820 [ok] [200] === 
2025/04/22 20:48:37 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /attachment/play/88563?PHPSESSID=10549lrqrenb33of28oh3bkmf3 [141.101.76.162] === 
2025/04/22 20:48:37 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:37 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:37 [info] [application]  === END REQUEST: /attachment/play/88563?PHPSESSID=10549lrqrenb33of28oh3bkmf3 [ok] [200] === 
2025/04/22 20:48:40 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/hide/71819 [172.71.95.101] === 
2025/04/22 20:48:40 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:40 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:40 [info] [application] POST:
2025/04/22 20:48:40 [info] [application]     [PHPSESSID] => 10549lrqrenb33of28oh3bkmf3
2025/04/22 20:48:40 [warning] [translations] Missing English translation for validators.length.toolong
2025/04/22 20:48:40 [info] [application]  === END REQUEST: /message/hide/71819 [ok] [200] === 
2025/04/22 20:48:43 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /message/hide/71818 [104.23.170.41] === 
2025/04/22 20:48:43 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:48:43 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:48:43 [info] [application] POST:
2025/04/22 20:48:43 [info] [application]     [PHPSESSID] => 10549lrqrenb33of28oh3bkmf3
2025/04/22 20:48:43 [warning] [translations] Missing English translation for validators.length.toolong
2025/04/22 20:48:43 [info] [application]  === END REQUEST: /message/hide/71818 [ok] [200] === 
2025/04/22 20:52:16 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /tag/proposed [104.23.166.51] === 
2025/04/22 20:52:16 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:52:16 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:52:16 [info] [application] POST:
2025/04/22 20:52:16 [info] [application]     [PHPSESSID] => 10549lrqrenb33of28oh3bkmf3
2025/04/22 20:52:16 [info] [application]  === END REQUEST: /tag/proposed [ok] [200] === 
2025/04/22 20:52:21 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /tag/proposed [104.23.166.51] === 
2025/04/22 20:52:21 [info] [application] COOKIE: PHPSESSID = '10549lrqrenb33of28oh3bkmf3'
2025/04/22 20:52:21 [info] [application] COOKIE: 7864f6975088e8fec0c71ceb71afa141 = '5bd3eaa6282757dbcc81cecd7055df34864a3adfa:4:{i:0;s:4:"5897";i:1;s:4:"Blas";i:2;i:2592000;i:3;a:0:{}}'
2025/04/22 20:52:21 [info] [application] POST:
2025/04/22 20:52:21 [info] [application]     [PHPSESSID] => 10549lrqrenb33of28oh3bkmf3
2025/04/22 20:52:21 [info] [application]  === END REQUEST: /tag/proposed [ok] [200] === 
2025/04/22 20:55:07 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] / [172.71.103.235] === 
2025/04/22 20:55:07 [warning] [translations] Missing English translation for _action.site/index
2025/04/22 20:55:07 [info] [application]  === END REQUEST: / [200] === 
2025/04/22 20:55:19 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] / [104.23.166.139] === 
2025/04/22 20:55:19 [warning] [translations] Missing English translation for _action.site/index
2025/04/22 20:55:19 [info] [application]  === END REQUEST: / [200] === 
2025/04/22 20:55:22 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] / [172.71.95.72] === 
2025/04/22 20:55:22 [warning] [translations] Missing English translation for _action.site/index
2025/04/22 20:55:22 [info] [application]  === END REQUEST: / [200] === 
2025/04/22 20:56:10 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] /area377/message/index [104.23.170.14] === 
2025/04/22 20:56:10 [warning] [translations] Missing English translation for _action.message/index
2025/04/22 20:56:10 [info] [application]  === END REQUEST: /area377/message/index [200] === 
2025/04/22 20:56:15 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] /site/index [172.71.95.147] === 
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for about.common.creator
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for about.common.developer_web_android
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for about.common.developer_iphone
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for about.common.supported_by
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for about.common.thanks
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for about.common.project_coordination
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for general.count_participants
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for general.count_messages
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for global.title
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for _action.site/index
2025/04/22 20:56:15 [warning] [translations] Missing English translation for _action.site/index
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for _label.messagesearchform.q
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for eyefree.nav.contentlink
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.home
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.places
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.global_message_index
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.participants
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.search
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.more
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for video.title
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.social
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.support
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for terms.title
2025/04/22 20:56:15 [warning] [translations] Missing 中文 translation for menu.contact
2025/04/22 20:56:15 [info] [application]  === END REQUEST: /site/index [200] === 
2025/04/22 20:57:23 [info] [application]  === BEGIN REQUEST: GET [blind.wiki] /area523/message/index?lang=1&in=523 [104.23.170.15] === 
2025/04/22 20:57:24 [warning] [translations] Missing English translation for _action.message/index
2025/04/22 20:57:24 [info] [application]  === END REQUEST: /area523/message/index?lang=1&in=523 [200] === 
2025/04/22 21:02:34 [info] [application]  === BEGIN REQUEST: POST [api.blind.wiki] /site/login [104.23.172.98] === 
2025/04/22 21:02:34 [info] [application] POST:
2025/04/22 21:02:34 [info] [application]     [LoginForm] => Array
2025/04/22 21:02:34 [info] [application]             [username] => blas
2025/04/22 21:02:34 [info] [application]             [password] => 1234
2025/04/22 21:02:34 [info] [application]             [latitude] => 41.38879
2025/04/22 21:02:34 [info] [application]             [longitude] => 2.15899
2025/04/22 21:02:34 [info] [application]     [PHPSESSID] => s041dk68hup4gelejcd2b3nbk0
2025/04/22 21:02:34 [warning] [translations] Missing English translation for app2.register.activation_needed2
2025/04/22 21:02:34 [info] [application]  === END REQUEST: /site/login [ok] [200] === 
2025/04/22 21:02:40 [info] [application]  === BEGIN REQUEST: GET [api.blind.wiki] /message/index?author_id=5897&PHPSESSID=6eu5p210oi1jb25h9gtl6c3ap6 [104.23.172.98] === 
2025/04/22 21:02:41 [info] [application]  === END REQUEST: /message/index?author_id=5897&PHPSESSID=6eu5p210oi1jb25h9gtl6c3ap6 [ok] [200] === 
