(function(WIN, DOC) {
	'use strict';

	if (!DOC.documentElement.classList.contains('js-enabled')) return; // html.js-enable がなかったら終了

	/*==================================================
		共通変数
	==================================================*/
	var page = {
		bodyElm: DOC.getElementsByTagName('body')[0],
		ht: WIN.innerHeight,
		scrollTop: 0,
		isSP: false,
		// スクロールイベントとリサイズイベントについて、他機能で参照必要なリスナーはここに登録
		scrollListener: {
			fadeTopbtn: null
		},
		resizeListener: {
			fadeTopbtn: null
		}
	};

	updateScrollTop();;
	setUA();


	/*==================================================
		汎用機能
	==================================================*/

	/* スムーススクロール
	----------------------------------------*/
	smoothScroll('a[href^="#anc"], a[href="#top"]');

	/* トグルリスト
	----------------------------------------*/
	setToggleList('.js-mod-faq-tgl',
		{
			HOOK_CLS_NAME: 'js-question-tgl-hook',
			CONT_CLS_NAME: 'js-answer-tgl-cont'
		}
	);

	/* モーダル
	----------------------------------------*/
	setModal('.js-modal');

	/* 電話番号リンク
	----------------------------------------*/
	addTelLink('.js-tel');;


	/*==================================================
		固有機能
	==================================================*/

	/* ページトップボタン 表示制御
	----------------------------------------*/
	var fadeTopbtn = fadeTopbtnClosure();
	fadeTopbtn();

	/* 動画制御
	----------------------------------------*/
	controlVideo()


	/*==================================================
		機能本体
	==================================================*/

	/**
	 * スムーススクロール
	 *
	 * @param {string} trgSlc 対象要素（アンカー）を収集するセレクター文字列
	 * @param {integer} opt.duration アニメーションに掛かる時間（ミリ秒）
	 * */

	function smoothScroll(trgSlc, opt) {
		var rootElms = DOC.querySelectorAll(trgSlc);
		var hash = '';
		var targetElm = null;
		var targetPos = 0;
		var startTime = 0;
		var DURATION = 1000;

		if (rootElms.length === 0) return; // 対象がなければ終了

		if (opt) { // オプション設定がある場合
			if (opt.DURATION) {
				DURATION = opt.DURATION;
			}
		}

		for (var i = 0; i <= rootElms.length - 1; i++) {
			rootElms[i].addEventListener('click', function(e) {
				e.preventDefault();
				WIN.removeEventListener('scroll', page.scrollListener.fadeTopbtn);

				hash = this.getAttribute('href');
				targetElm = DOC.getElementById(hash.substring(1));

				if (!targetElm) {
					if (hash === '#top') {
						targetElm = DOC.documentElement;
					} else {
						return; // リンク先要素が無かったら終了
					}
				}

				history.pushState(null, null, hash); // ブラウザ履歴追加

				targetPos = targetElm.getBoundingClientRect().top;
				updateScrollTop();
				startTime = Date.now();

				loop();

				// フォーカス処理
				targetElm.setAttribute('tabindex', '0');
				targetElm.focus();
				targetElm.removeAttribute('tabindex');
			});
		}

		function loop() {
			var currentTime = Date.now() - startTime;
			if (currentTime < DURATION) {
				scrollTo(0, setEasing(currentTime, page.scrollTop, targetPos, DURATION));
				WIN.requestAnimationFrame(loop);
			} else {
				scrollTo(0, targetPos + page.scrollTop);
				WIN.addEventListener('scroll', page.scrollListener.fadeTopbtn);
				fadeTopbtn();
			}
		}

		/*
		 * The setEasing() function is:
		 * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
		 *
		 * Uses the built in easing capabilities added In jQuery 1.1
		 * to offer multiple easing options
		 *
		 * TERMS OF USE - jQuery Easing
		 * 
		 * Open source under the BSD License. 
		 * 
		 * Copyright ﾂｩ 2008 George McGinley Smith
		 * All rights reserved.
		 * 
		 * Redistribution and use in source and binary forms, with or without modification, 
		 * are permitted provided that the following conditions are met:
		 * 
		 * Redistributions of source code must retain the above copyright notice, this list of 
		 * conditions and the following disclaimer.
		 * Redistributions in binary form must reproduce the above copyright notice, this list 
		 * of conditions and the following disclaimer in the documentation and/or other materials 
		 * provided with the distribution.
		 * 
		 * Neither the name of the author nor the names of contributors may be used to endorse 
		 * or promote products derived from this software without specific prior written permission.
		 * 
		 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY 
		 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
		 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
		 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
		 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
		 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED 
		 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
		 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED 
		 * OF THE POSSIBILITY OF SUCH DAMAGE. 
		 *
		*/

		function setEasing(t, b, c, d) { // easeOutQuart
			return -c * ((t = t / d - 1) * t * t * t - 1) + b;
		}
	}


	/**
	 * トグルリスト
	 *
	 * @param {string} trgSlc 対象要素（トグルの親要素）を収集するセレクター文字列
	 * @param {string} opt.HOOK_CLS_NAME ボタンのクラス名
	 * @param {string} opt.CONT_CLS_NAME コンテンツのクラス名
	 * */

	function setToggleList(trgSlc, opt) {
		var rootElms = DOC.querySelectorAll(trgSlc);
		var HOOK_CLS_NAME = 'js-tgl-hook';
		var CONT_CLS_NAME = 'js-tgl-cont';
		var OPEN_CLS_NAME = 'is-open';

		if (rootElms.length === 0) return; // 対象がなければ終了
		console.log('test');

		if (opt) { // オプション設定がある場合
			if (opt.HOOK_CLS_NAME) {
				HOOK_CLS_NAME = opt.HOOK_CLS_NAME;
			}
			if (opt.CONT_CLS_NAME) {
				CONT_CLS_NAME = opt.CONT_CLS_NAME;
			}
		}

		for (var i = 0; i <= rootElms.length - 1; i++) {
			var hookElms = rootElms[i].getElementsByClassName(HOOK_CLS_NAME);
			var contElms = rootElms[i].getElementsByClassName(CONT_CLS_NAME);

			if (hookElms.length === 0 || contElms.length === 0 || hookElms.length !== contElms.length) return; // 対象がないか、トグルとコンテンツの数が一致しない場合は終了

			for (var j = 0; j <= hookElms.length - 1; j++) {
				var hookElm = hookElms[j];
				var contElm = contElms[j];
				var btnElm = DOC.createElement('button');
				var tglInd = 'tgl-' + (i + 1) + '-' + (j + 1);

				btnElm.setAttribute('type', 'button');
				btnElm.innerHTML = hookElm.innerHTML;

				hookElm.innerHTML = '';
				hookElm.appendChild(btnElm);

				btnElm.setAttribute('aria-controls', tglInd);
				btnElm.setAttribute('aria-expanded', 'false');
				contElm.id = tglInd;
				contElm.setAttribute('aria-hidden', 'true');

				btnElm.addEventListener('click', function(e) {
					e.preventDefault();

					var thisHookElm = this.parentNode;
					var thisTglInd = this.getAttribute('aria-controls');
					var thisContElm = DOC.getElementById(thisTglInd);

					if (!thisHookElm.classList.contains(OPEN_CLS_NAME)) { // 開く
						thisContElm.style.height = thisContElm.scrollHeight + 'px';
						thisHookElm.classList.add(OPEN_CLS_NAME);
						this.setAttribute('aria-expanded', 'true');
						thisContElm.removeAttribute('aria-hidden');
					} else { // 閉じる
						thisHookElm.classList.remove(OPEN_CLS_NAME);
						this.setAttribute('aria-expanded', 'false');
						thisContElm.setAttribute('aria-hidden', 'true');
						thisContElm.style.height = '';
					}
				});
			}
		}
	}


	/**
	 * モーダル
	 *
	 * @param {string} trgSlc 対象要素（モーダル呼び出し元のアンカー）を収集するセレクター文字列
	 * */

	function setModal(trgSlc) {
		var rootElms = DOC.querySelectorAll(trgSlc);
		var OPEN_MODAL_CLS_NAME = 'is-open';
		var OPEN_BODY_CLS_NAME = 'is-open';
		var SCROLL_ELM_CLS_NAME = 'js-modal-scroll';
		var SCROLLABLE_CLS_NAME = 'is-scroll';
		var OVERLAY_ID_NAME = 'overlay';
		var MODAL_ICON = {
			SRC: '/shared/images/icon_modal_01.svg',
			ALT: '［モーダル］',
			WH: '16',
			CLS: 'icon-modal-01'
		};
		var CLOSE_BTN_CLS_NAME = 'btn-close';
		var CLOSE_BTN_TXT = '閉じる';
		var closeBtnMod = DOC.createElement('ul');
		var closeBtnElm = DOC.createElement('button');
		var firstFocusElm = DOC.createElement('div');
		var overlayElm = null;
		var currentOpenModal = null;
		var saveRootElm = null;
		var scrollElm = null;

		if (rootElms.length === 0) return; // 対象がなければ終了

		// 閉じるボタン生成
		// <ul class="btn-close">
		// <li><button type="button">閉じる</button></li>
		// </ul>
		var li = DOC.createElement('li');
		var text = DOC.createTextNode(CLOSE_BTN_TXT);
		closeBtnMod.classList.add(CLOSE_BTN_CLS_NAME);
		closeBtnElm.setAttribute('type', 'button');
		closeBtnElm.appendChild(text);
		li.appendChild(closeBtnElm);
		closeBtnMod.appendChild(li);

		// フォーカスをモーダルの外に出さないための要素
		firstFocusElm.setAttribute('tabindex', '0');

		overlayElm = setOverlay(OVERLAY_ID_NAME); // オーバーレイ追加

		for (var i = 0; i <= rootElms.length - 1; i++) {
			var rootElm = rootElms[i];
			var hash = rootElm.getAttribute('href');
			var modalElm = DOC.getElementById(hash.substring(1));

			if (!modalElm) return; // モーダル要素が無かったら終了

			rootElm.setAttribute('aria-haspopup', 'dialog');

			// モーダルアイコン付与
			var icon = DOC.createElement('img');
			icon.setAttribute('src', MODAL_ICON.SRC);
			icon.setAttribute('alt', MODAL_ICON.ALT);
			icon.setAttribute('width', MODAL_ICON.WH);
			icon.classList.add(MODAL_ICON.CLS);
			rootElm.appendChild(icon);
console.log('test');
			// モーダルの取得、属性値操作
			modalElm.setAttribute('role', 'dialog');
			modalElm.setAttribute('aria-modal', 'true');
			modalElm.setAttribute('aria-hidden', 'true');
			modalElm.setAttribute('tabindex', '0');

			rootElm.addEventListener('click', function(e) { // リンク元クリック
				e.preventDefault();
				WIN.removeEventListener('scroll', page.scrollListener.fadeTopbtn);
				WIN.removeEventListener('resize', page.resizeListener.fadeTopbtn);

				var thisHash = this.getAttribute('href');
				currentOpenModal = DOC.getElementById(thisHash.substring(1));
				saveRootElm = DOC.activeElement;

				updateScrollTop();
				page.bodyElm.style.top = page.scrollTop * -1 + 'px';

				// モーダルの属性値操作
				currentOpenModal.classList.add(OPEN_MODAL_CLS_NAME);
				currentOpenModal.removeAttribute('aria-hidden');

				currentOpenModal.appendChild(closeBtnMod); // 閉じるボタン追加
				currentOpenModal.parentNode.insertBefore(firstFocusElm, currentOpenModal); // フォーカス制御要素追加
				page.bodyElm.classList.add(OPEN_BODY_CLS_NAME); // オーバーレイ表示

				// スクロール設定
				scrollElm = currentOpenModal.getElementsByClassName(SCROLL_ELM_CLS_NAME)[0];
				verifyScrollable();

				// フォーカス処理
				(function firstFocus() { // すぐに focus() が効かないので、.js-modal から focus が離れるまで行う
					currentOpenModal.focus();

					var focusElm = DOC.activeElement;
					var timer = setTimeout(firstFocus, 300);

					if (!focusElm.classList.contains('js-modal')) {
						clearTimeout(timer);
					}
				}());

				// リサイズ
				WIN.addEventListener('resize', resizeEvent);

				// Escキー
				WIN.addEventListener('keydown', closeModal);
			});
		}

		// フォーカスをモーダルの外に出さないための処理
		firstFocusElm.addEventListener('DOMFocusIn', function(e) {
			closeBtnElm.focus();
		});
		closeBtnElm.addEventListener('keydown', function(e) {
			if (!e.shiftKey && e.key === 'Tab') { // Tab キー
				currentOpenModal.focus();
			}

		});

		closeBtnElm.addEventListener('click', closeModal); // 閉じるボタンクリック
		overlayElm.addEventListener('click', closeModal); // オーバーレイクリック

		function verifyScrollable() {
			var modalHt = currentOpenModal.clientHeight;
			var scrollHt = scrollElm.scrollHeight;

			if (modalHt < scrollHt) {
				scrollElm.classList.add(SCROLLABLE_CLS_NAME);
			} else {
				scrollElm.classList.remove(SCROLLABLE_CLS_NAME);
			}
		}
		var resizeEvent = setDebounce(verifyScrollable, 300);

		function closeModal(e) {
			if (e.type === 'keydown') {
				if (e.key !== 'Escape' && e.key !== 'Esc' && e.key !== 'Enter') {
					return;
				}
			}

			e.preventDefault();
			WIN.addEventListener('scroll', page.scrollListener.fadeTopbtn);

			page.bodyElm.style.top = 0;
			page.bodyElm.classList.remove(OPEN_BODY_CLS_NAME);
			saveRootElm.focus();
			scrollTo(0, page.scrollTop);

			currentOpenModal.classList.remove(OPEN_MODAL_CLS_NAME);
			currentOpenModal.setAttribute('aria-hidden', 'true');

			WIN.removeEventListener('keydown', closeModal);
			WIN.removeEventListener('resize', resizeEvent);
		}
	}


	/**
	 * 電話番号リンク
	 *
	 * @param {string} trgSlc 対象要素を収集するセレクター文字列
	 * */

	function addTelLink(trgSlc) {
		if (!page.isSP) return; // スマホ以外なら終了

		var rootElms = DOC.querySelectorAll(trgSlc);

		if (rootElms.length === 0) return; // 対象がなければ終了

		for (var i = 0; i <= rootElms.length - 1; i++) {
			var rootElm = rootElms[i];
			var numText = rootElm.innerText.replace(/[^0-9]/g, '');
			var a = DOC.createElement('a');

			a.setAttribute('href', 'tel:' + numText);
			a.innerHTML = rootElm.innerHTML;

			rootElm.innerHTML = '';
			rootElm.appendChild(a);
		}
	}


	/**
	 * ページトップボタン 表示制御
	 *
	 * */
	function fadeTopbtnClosure() {
		var ROOT_ID_NAME = 'btn-to-top';
		var SHOW_CLS_NAME = 'is-show';
		var THRESHOLD = 0.8;
		var isShow = false;

		var rootElm = DOC.getElementById(ROOT_ID_NAME);

		// 共通変数にイベントリスナ登録
		page.scrollListener.fadeTopbtn = setThrottle(updateIsShow, 200);
		page.resizeListener.fadeTopbtn = setDebounce(updateIsShow, 200);

		WIN.addEventListener('scroll', page.scrollListener.fadeTopbtn);
		WIN.addEventListener('resize', page.resizeListener.fadeTopbtn);

		function updateIsShow() {
			updateScrollTop();
			page.ht = WIN.innerHeight;

			var currentIsShow = true; // 表示切替を検知する変数

			if (page.scrollTop > page.ht * THRESHOLD) {
				currentIsShow = true;
			} else {
				currentIsShow = false;
			}

			if (isShow !== currentIsShow) { // currentIsShow の値が変わったら SHOW_CLS_NAME の付け外しを行う
				isShow = currentIsShow;

				if (isShow) {
					rootElm.classList.add(SHOW_CLS_NAME);
				} else {
					rootElm.classList.remove(SHOW_CLS_NAME);
				}
			}
		}

		return updateIsShow; // fadeTopbtn で使うため updateIsShow を return
	}


	/**
	 * 動画制御
	 * */

	function controlVideo() {
		var ROOT_ID_NAME = 'js-video';
		var ITEM_CLS_NAME = 'item';
		var BTN_CLS_NAME = 'btn-movie';
		var BTN_TXT = '再生';

		var rootElm = DOC.getElementById(ROOT_ID_NAME);
		var itemElms = [];

		if (!rootElm) return; // #js-video が無かったら終了

		itemElms = rootElm.getElementsByClassName(ITEM_CLS_NAME);

		if (itemElms.length === 0) return; // .itemElms が無かったら終了

		function VideoConst(thisVideo, thisBtn) { // コンストラクタ定義
			this.video = thisVideo;
			this.btn = thisBtn;
		}
		VideoConst.videoIndCount = 0;
		VideoConst.countUpVideoInd = function() {
			this.videoIndCount++;
			return this.videoIndCount;
		};
		VideoConst.prototype = {
			clickBtn: function(e) {
				e.preventDefault();

				this.btn.setAttribute('aria-pressed', 'true');
				this.btn.setAttribute('disabled', 'disabled');

				this.video.play();
			},
			endedVideo: function(e) {
				this.btn.setAttribute('aria-pressed', 'false');
				this.btn.removeAttribute('disabled');
			}
		};

		for (var i = 0; i <= itemElms.length - 1; i++) {
			var videoElm = itemElms[i].getElementsByTagName('video')[0];

			videoElm.addEventListener('loadedmetadata', function(e) { // メタデータの読み込み完了
				var videoInd = 'video-' + VideoConst.countUpVideoInd();
				this.id = videoInd;

				// ボタン要素生成
				// <ul class="btn-movie">
				// <li><button type="button" aria-pressed="false" aria-controls="video-*>再生</button></li>
				// </ul>
				var ul = DOC.createElement('ul');
				var li = DOC.createElement('li');
				var btnElm = DOC.createElement('button');
				var text = DOC.createTextNode(BTN_TXT);
				ul.classList.add(BTN_CLS_NAME);
				btnElm.setAttribute('type', 'button');
				btnElm.setAttribute('aria-pressed', 'false');
				btnElm.setAttribute('aria-controls', videoInd);
				btnElm.appendChild(text);
				li.appendChild(btnElm);
				ul.appendChild(li);

				this.parentNode.insertBefore(ul, this.nextSibling);

				var videoInst = new VideoConst(this, btnElm); // インスタンス作成

				videoInst.btn.addEventListener('click', videoInst.clickBtn.bind(videoInst)); // 再生ボタンクリック
				videoInst.video.addEventListener('ended', videoInst.endedVideo.bind(videoInst)); // 末尾まで再生終了
			});

		}
	}


	/**
	 * スクロールトップ値 更新
	 * */

	function updateScrollTop() {
		page.scrollTop = WIN.pageYOffset || DOC.documentElement.scrollTop;
	}


	/**
	 * UA 判定
	 * */

	function setUA() {
		var ua = navigator.userAgent;

		if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
			page.isSP = true;
		}
	}


	/**
	 * オーバーレイ追加
	 *
	 * @param {string} idName 作成、または取得するオーバーレイのid値
	 *
	 * @return 指定id要素
	 * */

	function setOverlay(idName) {
		var existingElm = DOC.getElementById(idName);

		if (existingElm) return existingElm; // 指定 id が既に存在していたら その要素を返す

		var overlayElm = DOC.createElement('div');
		overlayElm.id = idName;
		page.bodyElm.appendChild(overlayElm);

		return overlayElm;
	}


	/**
	 * throttle 関数
	 *
	 * @param {function} fn 間引き処理させる関数
	 * @param {integer} delay 間引く間隔
	 *
	 * @return 指定id要素
	 * */

	function setThrottle(fn, delay) {
		var timer = null;
		var lastExecTime = Date.now();

		return function() {
			var self = this;
			var args = arguments;
			var elapsedTime = Date.now() - lastExecTime;

			var execute = function() {
				fn.apply(self, args);
				lastExecTime = Date.now();

			};

			if (!timer) {
				execute();
			}

			if (timer) {
				clearTimeout(timer);
			}

			if (elapsedTime > delay) {
				execute();
			} else {
				timer = setTimeout(execute, delay);
			}
		};
	}


	/**
	 * debounce 関数
	 *
	 * @param {function} fn 連続呼び出しされたとき、最後の1回だけ実行する関数
	 * @param {integer} interval 処理を待つ時間
	 *
	 * @return 指定id要素
	 * */

	function setDebounce(fn, interval) {
		var timer;

		return function () {
			clearTimeout(timer);
			var self = this;
			var args = arguments;

			timer = setTimeout(function() {
				fn.apply(self, args);
			}, interval);
		};
	}

}(window, document));
