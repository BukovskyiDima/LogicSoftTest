
// popups init
function initPopups() {
  jQuery('.popup-holder').contentPopup({
    mode: 'click',
    hideOnClickLink: 'popup-active',
    hideOnClickOutside: 'popup-active'
  });
}

// mobile menu init
function initMobileNav() {
  jQuery('body').mobileNav({
    menuActiveClass: 'nav-active',
    menuOpener: '.nav-opener',
    hideOnClickOutside: true,
    menuDrop: 'ul'
  });
}

/*
 * Popups plugin
 */
;(function($) {
  function ContentPopup(opt) {
    this.options = $.extend({
      holder: null,
      popup: '.popup',
      btnOpen: '.open',
      btnClose: '.close',
      openClass: 'popup-active',
      clickEvent: 'click',
      mode: 'click',
      hideOnClickLink: true,
      hideOnClickOutside: true,
      delay: 50
    }, opt);
    if (this.options.holder) {
      this.holder = $(this.options.holder);
      this.init();
    }
  }
  ContentPopup.prototype = {
    init: function() {
      this.findElements();
      this.attachEvents();
    },
    findElements: function() {
      this.popup = this.holder.find(this.options.popup);
      this.btnOpen = this.holder.find(this.options.btnOpen);
      this.btnClose = this.holder.find(this.options.btnClose);
    },
    attachEvents: function() {
      // handle popup openers
      var self = this;
      this.clickMode = isTouchDevice || (self.options.mode === self.options.clickEvent);

      if (this.clickMode) {
        // handle click mode
        this.btnOpen.bind(self.options.clickEvent + '.popup', function(e) {
          if (self.holder.hasClass(self.options.openClass)) {
            if (self.options.hideOnClickLink) {
              self.hidePopup();
            }
          } else {
            self.showPopup();
          }
          e.preventDefault();
        });

        // prepare outside click handler
        this.outsideClickHandler = this.bind(this.outsideClickHandler, this);
      } else {
        // handle hover mode
        var timer, delayedFunc = function(func) {
          clearTimeout(timer);
          timer = setTimeout(function() {
            func.call(self);
          }, self.options.delay);
        };
        this.btnOpen.on('mouseover.popup', function() {
          delayedFunc(self.showPopup);
        }).on('mouseout.popup', function() {
          delayedFunc(self.hidePopup);
        });
        this.popup.on('mouseover.popup', function() {
          delayedFunc(self.showPopup);
        }).on('mouseout.popup', function() {
          delayedFunc(self.hidePopup);
        });
      }

      // handle close buttons
      this.btnClose.on(self.options.clickEvent + '.popup', function(e) {
        self.hidePopup();
        e.preventDefault();
      });
    },
    outsideClickHandler: function(e) {
      // hide popup if clicked outside
      var targetNode = $((e.changedTouches ? e.changedTouches[0] : e).target);
      if (!targetNode.closest(this.popup).length && !targetNode.closest(this.btnOpen).length) {
        this.hidePopup();
      }
    },
    showPopup: function() {
      // reveal popup
      this.holder.addClass(this.options.openClass);
      this.popup.css({
        display: 'block'
      });

      // outside click handler
      if (this.clickMode && this.options.hideOnClickOutside && !this.outsideHandlerActive) {
        this.outsideHandlerActive = true;
        $(document).on('click touchstart', this.outsideClickHandler);
      }
    },
    hidePopup: function() {
      // hide popup
      this.holder.removeClass(this.options.openClass);
      this.popup.css({
        display: 'none'
      });

      // outside click handler
      if (this.clickMode && this.options.hideOnClickOutside && this.outsideHandlerActive) {
        this.outsideHandlerActive = false;
        $(document).off('click touchstart', this.outsideClickHandler);
      }
    },
    bind: function(f, scope, forceArgs) {
      return function() {
        return f.apply(scope, forceArgs ? [forceArgs] : arguments);
      };
    },
    destroy: function() {
      this.popup.removeAttr('style');
      this.holder.removeClass(this.options.openClass);
      this.btnOpen.add(this.btnClose).add(this.popup).off('.popup');
      $(document).off('click touchstart', this.outsideClickHandler);
    }
  };

  // detect touch devices
  var isTouchDevice = /Windows Phone/.test(navigator.userAgent) || ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch;

  // jQuery plugin interface
  $.fn.contentPopup = function(opt) {
    var args = Array.prototype.slice.call(arguments);
    var method = args[0];

    return this.each(function() {
      var $holder = jQuery(this);
      var instance = $holder.data('ContentPopup');

      if (typeof opt === 'object' || typeof opt === 'undefined') {
        $holder.data('ContentPopup', new ContentPopup($.extend({
          holder: this
        }, opt)));
      } else if (typeof method === 'string' && instance) {
        if (typeof instance[method] === 'function') {
          args.shift();
          instance[method].apply(instance, args);
        }
      }
    });
  };
}(jQuery));

/*
 * Simple Mobile Navigation
 */
;(function($) {
  function MobileNav(options) {
    this.options = $.extend({
      container: null,
      hideOnClickOutside: false,
      menuActiveClass: 'nav-active',
      menuOpener: '.nav-opener',
      menuDrop: '.nav-drop',
      toggleEvent: 'click',
      outsideClickEvent: 'click touchstart pointerdown MSPointerDown'
    }, options);
    this.initStructure();
    this.attachEvents();
  }
  MobileNav.prototype = {
    initStructure: function() {
      this.page = $('html');
      this.container = $(this.options.container);
      this.opener = this.container.find(this.options.menuOpener);
      this.drop = this.container.find(this.options.menuDrop);
    },
    attachEvents: function() {
      var self = this;

      if(activateResizeHandler) {
        activateResizeHandler();
        activateResizeHandler = null;
      }

      this.outsideClickHandler = function(e) {
        if(self.isOpened()) {
          var target = $(e.target);
          if(!target.closest(self.opener).length && !target.closest(self.drop).length) {
            self.hide();
          }
        }
      };

      this.openerClickHandler = function(e) {
        e.preventDefault();
        self.toggle();
      };

      this.opener.on(this.options.toggleEvent, this.openerClickHandler);
    },
    isOpened: function() {
      return this.container.hasClass(this.options.menuActiveClass);
    },
    show: function() {
      this.container.addClass(this.options.menuActiveClass);
      if(this.options.hideOnClickOutside) {
        this.page.on(this.options.outsideClickEvent, this.outsideClickHandler);
      }
    },
    hide: function() {
      this.container.removeClass(this.options.menuActiveClass);
      if(this.options.hideOnClickOutside) {
        this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
      }
    },
    toggle: function() {
      if(this.isOpened()) {
        this.hide();
      } else {
        this.show();
      }
    },
    destroy: function() {
      this.container.removeClass(this.options.menuActiveClass);
      this.opener.off(this.options.toggleEvent, this.clickHandler);
      this.page.off(this.options.outsideClickEvent, this.outsideClickHandler);
    }
  };

  var activateResizeHandler = function() {
    var win = $(window),
      doc = $('html'),
      resizeClass = 'resize-active',
      flag, timer;
    var removeClassHandler = function() {
      flag = false;
      doc.removeClass(resizeClass);
    };
    var resizeHandler = function() {
      if(!flag) {
        flag = true;
        doc.addClass(resizeClass);
      }
      clearTimeout(timer);
      timer = setTimeout(removeClassHandler, 500);
    };
    win.on('resize orientationchange', resizeHandler);
  };

  $.fn.mobileNav = function(opt) {
    var args = Array.prototype.slice.call(arguments);
    var method = args[0];

    return this.each(function() {
      var $container = jQuery(this);
      var instance = $container.data('MobileNav');

      if (typeof opt === 'object' || typeof opt === 'undefined') {
        $container.data('MobileNav', new MobileNav($.extend({
          container: this
        }, opt)));
      } else if (typeof method === 'string' && instance) {
        if (typeof instance[method] === 'function') {
          args.shift();
          instance[method].apply(instance, args);
        }
      }
    });
  };
}(jQuery));

$( ".form-validation" ).validate({
  rules: {
    name: {
      required: true
    },
    phone: {
      required: true
    }
  },
  messages: {
    name: {
      required: 'Введите имя'
    },
    phone: {
      required: 'Введите телефон'
    }
  }
});

jQuery(function() {
  initPopups();
  initMobileNav();
});
