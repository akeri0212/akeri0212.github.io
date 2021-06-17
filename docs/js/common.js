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

	updateScrollTop();
	setUA();


	/*==================================================
		汎用機能
	==================================================*/

	/* スムーススクロール
	----------------------------------------*/
	smoothScroll('a[href^="#anc"], a[href="#top"]');


	/*==================================================
		固有機能
	==================================================*/

	/* ページトップボタン 表示制御
	----------------------------------------*/
	var fadeTopbtn = fadeTopbtnClosure();
	fadeTopbtn();


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
		const rootElms = DOC.querySelectorAll(trgSlc);
		let hash = '';
		let targetElm = null;
		let targetPos = 0;
		let startTime = 0;
		const DURATION = 1000;

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
			let currentTime = Date.now() - startTime;
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
	 * ハンバーガーメニュー
	 *
	 * @param {string} trgSlc 対象要素（アンカー）を収集するセレクター文字列
	 * @param {integer} opt.duration アニメーションに掛かる時間（ミリ秒）
	 * */

	function toggleSpmenu(trgSlc, opt) {
        var root = DOC.getElementById('hamburger-menu');
        var btn = DOC.getElementById('spmenu-btn');
        var contentWrap = DOC.getElementById('hamburger-menu-content-wrap');
        var content = DOC.getElementById('hamburger-menu-content');
        var body = DOC.body;
        var focusable = root.querySelectorAll('a, area, input, select, textarea, button, [tabindex]');
        var FOCUS_CONTROL_CLASS = 'js-hamburger-menu-focus-control';
        var FIXED_CLASS = 'is-fixed';
        var OPEN_CLASS = 'is-open';

        var firstFocus = DOC.createElement('div');
        var lastFocus = DOC.createElement('div');
        var scrollTop = 0;
        var scrollbarWidth = 0;
        var isOpen = false;

        var resizeEvent = function () {
            if (!isSP.matches) {
                menuClose();
            }
        };

        var menuOpen = function () {
            // scrollTop値をセット
            scrollTop = window.pageYOffset || DOC.documentElement.scrollTop;
            body.style.top = (scrollTop * -1) + 'px';

            // スクロールバー幅のpadding-right値をセット
            scrollbarWidth = window.innerWidth - body.clientWidth;
            body.style.paddingRight = scrollbarWidth + 'px';

            // focus制御検知要素をfocus可能にする
            firstFocus.setAttribute('tabindex', '0');
            lastFocus.setAttribute('tabindex', '0');

            body.classList.add(FIXED_CLASS);
            root.classList.add(OPEN_CLASS);
            btn.setAttribute('aria-expanded', 'true');
            isOpen = true;

            window.addEventListener('resize', resizeEvent);
        };

        var menuClose = function () {
            body.style.top = '0';
            body.style.paddingRight = '0';
            firstFocus.removeAttribute('tabindex');
            lastFocus.removeAttribute('tabindex');
            body.classList.remove(FIXED_CLASS);
            root.classList.remove(OPEN_CLASS);
            btn.setAttribute('aria-expanded', 'false');
            scrollTo(0, scrollTop);
            isOpen = false;

            window.removeEventListener('resize', resizeEvent);
        };

        // オーバーレイとfocus制御検知要素を追加
        firstFocus.classList.add(FOCUS_CONTROL_CLASS);
        lastFocus.classList.add(FOCUS_CONTROL_CLASS);
        root.insertBefore(firstFocus, root.firstChild);
        root.appendChild(lastFocus);

        btn.addEventListener('click', function () {
            if (isOpen) {
                menuClose();
            } else {
                menuOpen();
            }
        });

        contentWrap.addEventListener('click', function () {
            menuClose();
        });

        content.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        // focus制御（逆順）
        firstFocus.addEventListener('focus', function () {
            var i = focusable.length - 1;

            // メニュー内のfocus可能要素に対し、正しくfocus移動するまで focus() する
            for (i; i >= 0; i--) {
                focusable[i].focus();

                if (DOC.activeElement !== this) {
                    return;
                }
            }
        });

        // focus制御（正順）
        lastFocus.addEventListener('focus', function () {
            var i = 0;

            // メニュー内のfocus可能要素に対し、正しくfocus移動するまで focus() する
            for (i; i < focusable.length; i++) {
                focusable[i].focus();

                if (DOC.activeElement !== this) {
                    return;
                }
            }
        });
    };

	/**
	 * ページトップボタン 表示制御
	 *
	 * */
	function fadeTopbtnClosure() {
		const ROOT_ID_NAME = 'btn-to-top';
        const FADEIN_CLASS_NAME = 'is-fadein';
		const SHOW_CLASS_NAME = 'is-show';
        const FADEOUT_CLASS_NAME = 'is-fadeout';
		const THRESHOLD = 0.8;
		let isShow = false;

		const rootElm = DOC.getElementById(ROOT_ID_NAME);

		rootElm.addEventListener('animationend', function () {
			console.log('animationend');
			if(isShow) {
				rootElm.classList.remove(FADEIN_CLASS_NAME);
				this.classList.add(SHOW_CLASS_NAME);
			}else{
				rootElm.classList.remove(FADEOUT_CLASS_NAME);
				this.classList.remove(SHOW_CLASS_NAME);
			}
		});

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

			if (isShow !== currentIsShow) { // currentIsShow の値が変わったら SHOW_CLASS_NAME の付け外しを行う
				isShow = currentIsShow;
				console.log('updateIsShow');

				if (isShow) {
					rootElm.classList.add('is-fadein');
				} else {
					rootElm.classList.add('is-fadeout');
				}
			}
		}

		return updateIsShow; // fadeTopbtn で使うため updateIsShow を return
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

	// function setOverlay(idName) {
	// 	var existingElm = DOC.getElementById(idName);

	// 	if (existingElm) return existingElm; // 指定 id が既に存在していたら その要素を返す

	// 	var overlayElm = DOC.createElement('div');
	// 	overlayElm.id = idName;
	// 	page.bodyElm.appendChild(overlayElm);

	// 	return overlayElm;
	// }


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
