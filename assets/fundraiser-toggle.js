/* "Supporting a fundraiser?" card (snippets/fundraiser-toggle.liquid).

   Ported from the old live theme's hit-fundraiser-toggle.js. The three cart
   attribute keys and their values are read by a Shopify Flow workflow (it
   tags "no code" orders needs-tethering and emails support), so keep them
   word for word.

   Ambassador codes are 0%-off discount codes set to combine with everything:
   Apply stacks the code on top of whatever codes are already on the cart, and
   a code worth nothing is taken as the ambassador code. Checkout is never
   blocked; an unsaved name gets up to 2.5s to save first. */
(function () {
  if (customElements.get('fundraiser-toggle')) return;

  var ATTR_ON = 'Supporting a fundraiser';
  var ATTR_NAME = 'Fundraiser name (no code)';
  var ATTR_STATUS = 'Fundraiser status';
  var STATUS_CODE = 'Ambassador code applied';
  var STATUS_NAME = 'Name given, no code';
  var STATUS_YES = 'Said yes, no code or name';

  /* A message that has to outlive the re-render (drawer) or reload (cart
     page) that follows an apply. */
  var MSG_KEY = 'fr-toggle-msg';

  var root = (window.Shopify && window.Shopify.routes && window.Shopify.routes.root) || '/';
  var pending = null;

  /* Remember the latest save so Checkout can wait for it. */
  function track(p) {
    pending = p;
    p.catch(function () {}).then(function () {
      if (pending === p) pending = null;
    });
    return p;
  }
  function quiet(p) {
    return p.catch(function () {});
  }

  function getCart() {
    return fetch(root + 'cart.js', { headers: { Accept: 'application/json' } }).then(function (r) {
      return r.json();
    });
  }
  function updateCart(body) {
    return fetch(root + 'cart/update.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
    }).then(function (r) {
      return r.json();
    });
  }

  function appliedCodes(cart) {
    return (cart.discount_codes || [])
      .filter(function (d) {
        return d.applicable;
      })
      .map(function (d) {
        return d.code;
      });
  }
  function same(a, b) {
    return String(a).toLowerCase() === String(b).toLowerCase();
  }
  /* The code's configured value (0 for an ambassador code), from the cart- or
     line-level application it created; null if it isn't on the cart. */
  function codeValue(cart, code) {
    var apps = cart.cart_level_discount_applications || [];
    for (var i = 0; i < apps.length; i++) {
      if (same(apps[i].title, code)) return Math.abs(parseFloat(apps[i].value) || 0);
    }
    var items = cart.items || [];
    for (var j = 0; j < items.length; j++) {
      var allocs = items[j].line_level_discount_allocations || [];
      for (var k = 0; k < allocs.length; k++) {
        var app = allocs[k].discount_application || {};
        if (same(app.title, code)) return Math.abs(parseFloat(app.value) || 0);
      }
    }
    return null;
  }

  function stashMessage(context, text, kind) {
    try {
      sessionStorage.setItem(MSG_KEY, JSON.stringify({ context: context, text: text, kind: kind || '' }));
    } catch (e) {}
  }

  class FundraiserToggle extends HTMLElement {
    connectedCallback() {
      if (this._ready) return;
      this._ready = true;
      this._timer = null;
      this.addEventListener('click', this.onClick.bind(this));

      var name = this.querySelector('[data-hit-name]');
      if (name) {
        name.addEventListener('input', this.onNameInput.bind(this));
        name.addEventListener('change', this.saveName.bind(this));
        /* Enter would submit the cart page's form, i.e. go to checkout */
        name.addEventListener(
          'keydown',
          function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              quiet(this.saveName());
            }
          }.bind(this)
        );
      }
      var code = this.querySelector('[data-hit-code]');
      if (code) {
        code.addEventListener(
          'keydown',
          function (e) {
            if (e.key === 'Enter') {
              e.preventDefault();
              this.applyCode();
            }
          }.bind(this)
        );
      }

      this.showStashedMessage();

      /* The green note is showing (a code came in from a share link) but an
         earlier "no code" answer is still on the cart: correct it, or Flow
         would flag an order that has its code. */
      if (this.getAttribute('data-amb') && /no code/i.test(this.getAttribute('data-status') || '')) {
        var attrs = {};
        attrs[ATTR_ON] = 'Yes';
        attrs[ATTR_STATUS] = STATUS_CODE;
        attrs[ATTR_NAME] = '';
        quiet(track(updateCart({ attributes: attrs })));
      }
    }

    onClick(e) {
      var btn = e.target.closest('[data-hit]');
      if (!btn || !this.contains(btn)) return;
      var action = btn.getAttribute('data-hit');
      if (action === 'toggle') this.toggle(btn);
      else if (action === 'apply') this.applyCode();
      else if (action === 'noname') this.openName(btn);
      else if (action === 'remove') this.removeCode(btn.getAttribute('data-code'));
    }

    msg(text, kind) {
      var el = this.querySelector('[data-hit-msg]');
      if (!el) return;
      el.textContent = text || '';
      el.className = 'body fr-toggle__msg' + (kind ? ' fr-toggle__msg--' + kind : '');
    }
    showStashedMessage() {
      var raw = null;
      try {
        raw = sessionStorage.getItem(MSG_KEY);
      } catch (e) {}
      if (!raw) return;
      var m = null;
      try {
        m = JSON.parse(raw);
      } catch (e) {}
      if (!m || m.context !== this.getAttribute('data-context') || !this.querySelector('[data-hit-msg]')) return;
      try {
        sessionStorage.removeItem(MSG_KEY);
      } catch (e) {}
      this.msg(m.text, m.kind);
    }

    nameValue() {
      var el = this.querySelector('[data-hit-name]');
      return el ? el.value.trim() : '';
    }
    statusFor(name) {
      return name ? STATUS_NAME : STATUS_YES;
    }

    toggle(btn) {
      var on = btn.getAttribute('aria-checked') !== 'true';
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
      var panel = this.querySelector('[data-hit-panel]');
      if (panel) panel.hidden = !on;
      this.msg('');
      var attrs = {};
      if (on) {
        attrs[ATTR_ON] = 'Yes';
        attrs[ATTR_STATUS] = this.statusFor(this.nameValue());
        var code = this.querySelector('[data-hit-code]');
        if (code)
          setTimeout(function () {
            code.focus();
          }, 50);
      } else {
        /* blank values remove the attributes from the cart */
        attrs[ATTR_ON] = '';
        attrs[ATTR_STATUS] = '';
        attrs[ATTR_NAME] = '';
      }
      quiet(track(updateCart({ attributes: attrs })));
    }

    openName(btn) {
      btn.hidden = true;
      var wrap = this.querySelector('[data-hit-name-wrap]');
      if (wrap) wrap.hidden = false;
      var input = this.querySelector('[data-hit-name]');
      if (input) input.focus();
    }
    onNameInput() {
      clearTimeout(this._timer);
      this._timer = setTimeout(
        function () {
          quiet(this.saveName());
        }.bind(this),
        600
      );
    }
    saveName() {
      clearTimeout(this._timer);
      var name = this.nameValue();
      var attrs = {};
      attrs[ATTR_ON] = 'Yes';
      attrs[ATTR_NAME] = name;
      attrs[ATTR_STATUS] = this.statusFor(name);
      var input = this.querySelector('[data-hit-name]');
      return track(updateCart({ attributes: attrs })).then(function (cart) {
        /* saved: Checkout no longer needs to wait for this value */
        if (input && input.value.trim() === name) input.defaultValue = input.value;
        return cart;
      });
    }

    applyCode() {
      var input = this.querySelector('[data-hit-code]');
      var applyBtn = this.querySelector('[data-hit="apply"]');
      var code = input ? input.value.trim().replace(/\s+/g, '') : '';
      if (!code) {
        this.msg('Enter the ambassador code first.', 'error');
        return;
      }
      if (applyBtn) applyBtn.disabled = true;
      this.msg('Applying…');

      var self = this;
      var context = this.getAttribute('data-context');
      var job = getCart()
        .then(function (cart) {
          var before = appliedCodes(cart);
          var already = before.some(function (c) {
            return same(c, code);
          });
          /* on top of the codes already there, never instead of them */
          var next = already ? before : before.concat([code]);
          /* Applying a code means they said yes: re-save that alongside the
             code, so a toggle save that got lost on a bad connection can't
             leave the order without it. */
          var yes = {};
          yes[ATTR_ON] = 'Yes';
          yes[ATTR_STATUS] = self.statusFor(self.nameValue());
          return updateCart({ discount: next.join(','), attributes: yes })
            .then(getCart)
            .then(function (after) {
              var entry = (after.discount_codes || []).filter(function (d) {
                return same(d.code, code);
              })[0];
              if (!entry || !entry.applicable) {
                return updateCart({ discount: before.join(',') }).then(function () {
                  self.msg('That code didn’t work. Double-check it, or tap “Don’t have it?” below.', 'error');
                });
              }
              if (codeValue(after, entry.code) === 0) {
                var attrs = {};
                attrs[ATTR_ON] = 'Yes';
                attrs[ATTR_STATUS] = STATUS_CODE;
                attrs[ATTR_NAME] = '';
                return updateCart({ attributes: attrs }).then(function () {
                  return self.refresh();
                });
              }
              /* a promo code: it stays applied, and the shopper can still add
                 an ambassador code */
              stashMessage(context, 'Applied! That one is a discount code. Have an ambassador code too? Add it here.', 'ok');
              return self.refresh();
            });
        })
        .catch(function () {
          self.msg('Something went wrong. You can still check out, and we’ll sort out the credit.', 'error');
        })
        .then(function () {
          if (applyBtn) applyBtn.disabled = false;
        });
      track(job);
    }

    removeCode(code) {
      var self = this;
      quiet(
        track(
          getCart()
            .then(function (cart) {
              var next = appliedCodes(cart).filter(function (c) {
                return !same(c, code);
              });
              var attrs = {};
              attrs[ATTR_ON] = '';
              attrs[ATTR_STATUS] = '';
              return updateCart({ discount: next.join(','), attributes: attrs });
            })
            /* re-draw even if a request failed, so the button never goes dead */
            .catch(function () {})
            .then(function () {
              return self.refresh();
            })
        )
      );
    }

    /* Re-draw the cart so totals and this card match the new codes. The drawer
       swaps in a fresh .drawer__inner (as Dawn's cart-drawer.js does); the
       cart page is a plain form, so it reloads. */
    refresh() {
      if (this.getAttribute('data-context') === 'drawer') {
        var drawer = this.closest('cart-drawer');
        return fetch(root + '?sections=cart-drawer')
          .then(function (r) {
            return r.json();
          })
          .then(function (sections) {
            var html = sections && sections['cart-drawer'];
            var fresh = html && new DOMParser().parseFromString(html, 'text/html').querySelector('.drawer__inner');
            var current = drawer && drawer.querySelector('.drawer__inner');
            if (fresh && current) current.innerHTML = fresh.innerHTML;
          });
      }
      window.location.reload();
      return new Promise(function () {}); // the page is going away
    }
  }
  customElements.define('fundraiser-toggle', FundraiserToggle);

  /* Checkout: if a name is still saving (or typed but not saved yet), hold the
     click until it lands or 2.5s pass, then let it through no matter what. */
  document.addEventListener(
    'click',
    function (e) {
      var btn = e.target.closest('[name="checkout"]');
      if (!btn || btn.dataset.frFlushed === '1') return;
      var names = document.querySelectorAll('fundraiser-toggle [data-hit-name]');
      var unsaved = Array.prototype.some.call(names, function (i) {
        return i.value.trim() !== (i.defaultValue || '').trim();
      });
      if (!pending && !unsaved) return;

      e.preventDefault();
      e.stopPropagation();
      var saves = Array.prototype.map.call(document.querySelectorAll('fundraiser-toggle'), function (t) {
        var n = t.querySelector('[data-hit-name]');
        return n && n.value.trim() !== (n.defaultValue || '').trim() ? t.saveName() : Promise.resolve();
      });
      var timeout = new Promise(function (resolve) {
        setTimeout(resolve, 2500);
      });
      Promise.race([Promise.all(saves.concat([pending || Promise.resolve()])), timeout])
        .catch(function () {})
        .then(function () {
          btn.dataset.frFlushed = '1';
          btn.click();
        });
    },
    true
  );
})();
