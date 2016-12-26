var swipe = {
  touchStartPos: 0,
  lastXPos: 0,
  lastYPos: 0,
  moveX: 0,
  index: 0,
  height: 0,
  slideNumber: 0,
  slideWidth: 0,
  containerEl: null,
  headerEl: null,
  contentEl: null,
  lock: null,
  longTouch: false,
  iOSBack: null,
  iOSBackCb: null,

  // in react or probably anything else, you would just bind
  // all these events using JSX, rather than this function
  bind: function(elem) {
    swipe.containerEl = elem
    swipe.headerEl =  elem.querySelector('.swipe-header')
    swipe.contentEl = elem.querySelector('.swipe-content')

    swipe.iOSBack = swipe.containerEl

    swipe.contentEl.addEventListener('touchstart', swipe.contentTouchStart)
    swipe.contentEl.addEventListener('touchmove', swipe.contentTouchMove)
    swipe.contentEl.addEventListener('touchend', swipe.contentTouchEnd)
    swipe.contentEl.addEventListener('touchcancel', swipe.contentTouchEnd)

    swipe.headerEl.children[0].children[swipe.index].className += ' active'

    for (var i=0; i<swipe.headerEl.children[0].children.length; i++) {
      swipe.headerEl.children[0].children[i].addEventListener('touchstart', swipe.navigate(i))
    }

    window.addEventListener('resize', swipe.setSizes)
  },
  setSizes: function() {
    // don't do anything if person is in the middle of a swipe
    // it's get jerky and yuck
    if (swipe.lock === null) {
      requestAnimationFrame(function() {
        swipe.slideNumber = swipe.contentEl.children.length -1
        swipe.slideWidth = swipe.contentEl.children[0].offsetWidth

        var h = ''
        if (swipe.height !== 0) {
          h = 'height:'+swipe.height+'px;'
        }
        swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0);'+h)
        var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
        swipeBar.setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate3d('+swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + 'px,0,0)')
      })
    }
  },
  navigate: function(pane, cb) {
    return function() {
      // remove old classes
      swipe.headerEl.children[0].children[swipe.index].className = swipe.headerEl.children[0].children[swipe.index].className.replace(' active', '')
      var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
      swipeBar.className = swipeBar.className.replace(' swipe-animate', '')
      swipe.contentEl.className = swipe.contentEl.className.replace(' swipe-animate', '')

      swipe.index = pane

      var h = ''
      if (swipe.height !== 0) {
        h = 'height:'+swipe.height+'px;'
      }

      // animate everything
      swipe.contentEl.className = swipe.contentEl.className + ' swipe-animate'
      swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0);'+h)
      swipe.headerEl.children[0].children[swipe.index].className += ' active'
      swipeBar.className = swipeBar.className + ' swipe-animate'
      swipeBar.setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate('+swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + 'px)')

      // bit of a hack specifically for transit app
      if (cb) {
        swipe.height = cb(swipe.index)
      }
      if (swipe.height !== 0) {
        h = 'height:'+swipe.height+'px;'
      }
      setTimeout(function() {
        requestAnimationFrame(function() {
          swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0);'+h)
        })
      }, 350)
    }
  },
  contentTouchStart: function(event) {
    // This is a hack to detect flicks  
    swipe.longTouch = false
    setTimeout(function() {
      swipe.longTouch = true
    }, 250)
    swipe.touchStartPos = event.touches[0].pageX
    swipe.lastXPos = event.touches[0].pageX
    swipe.lastYPos = event.touches[0].pageY
    swipe.contentEl.className = swipe.contentEl.className.replace(' swipe-animate', '')
    if (swipe.iOSBack !== null) {
      swipe.iOSBack.className = swipe.iOSBack.className.replace(' swipe-animate', '')
    }
    var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
    swipeBar.className = swipeBar.className.replace(' swipe-animate', '')
  },
  contentTouchMove: function(event, shouldNotMoveX) {
    swipe.lastXPos = event.touches[0].pageX
    if (swipe.lock === null) {
      var thresh = 7
      swipe.fakeStartPos = swipe.touchStartPos
      if (swipe.lastYPos > event.touches[0].pageY + thresh || swipe.lastYPos < event.touches[0].pageY - thresh) {
        swipe.lock = 'y'
      } else {
        if (swipe.iOSBack !== null && swipe.touchStartPos - swipe.iOSBack.getBoundingClientRect().left < 25) {
          swipe.lock = 'ios'
        } else {
          if (shouldNotMoveX !== true) {
            swipe.lock = 'x'
            swipe.fakeStartPos = swipe.lastXPos
          }
        }        
      }
    }
    // uses the fake start pos
    swipe.moveX = swipe.index * swipe.slideWidth + (swipe.fakeStartPos - event.touches[0].pageX)
    if (swipe.lock === 'x') {
      event.preventDefault()
      if (swipe.moveX < 0 || swipe.moveX > swipe.slideWidth * swipe.slideNumber) {
        return  
      }
      var h = ''
      if (swipe.height !== 0) {
        h = 'height:'+swipe.height+'px;'
      }
      swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.moveX+'px,0,0);'+h)
      var slideWidth = swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + (((swipe.fakeStartPos - event.touches[0].pageX)/swipe.slideWidth)*swipe.headerEl.children[0].children[0].offsetWidth)
      swipe.headerEl
        .querySelector('.swipe-bar')
        .setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate('+ slideWidth + 'px)')
    } else if (swipe.lock === 'ios') {
      event.preventDefault()
      var pos = (swipe.index * swipe.slideWidth) - swipe.moveX
      if (pos < 0) {
        pos = 0
      }
      swipe.iOSBack.setAttribute('style', 'transform: translate3d('+pos+'px,0,0);animation:none;')
    }
  },
  contentTouchEnd: function(event, cb) {
    if (swipe.lock === 'x') {
      swipe.headerEl.children[0].children[swipe.index].className = swipe.headerEl.children[0].children[swipe.index].className.replace(' active', '')

      var absMove = Math.abs(swipe.index * swipe.slideWidth - swipe.moveX)
      if (absMove > swipe.slideWidth/2 || swipe.longTouch === false) {
        // rejects touches that don't really move
        if (Math.abs(swipe.touchStartPos - swipe.lastXPos) > 3) {
          // determines which way the swipe was
          if (swipe.moveX > swipe.index * swipe.slideWidth && swipe.index < swipe.slideNumber) {
            swipe.index++
          } else if (swipe.moveX < swipe.index * swipe.slideWidth && swipe.index > 0) {
            swipe.index--
          }
        }
      }

      var h = ''
      if (swipe.height !== 0) {
        h = 'height:'+swipe.height+'px;'
      }
      swipe.contentEl.className = swipe.contentEl.className + ' swipe-animate'
      swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0);'+h)
      
      swipe.headerEl.children[0].children[swipe.index].className += ' active'
      var swipeBar = swipe.headerEl.querySelector('.swipe-bar')
      swipeBar.className = swipeBar.className + ' swipe-animate'
      swipeBar.setAttribute('style', 'width:' + swipe.headerEl.children[0].children[0].offsetWidth + 'px;transform:translate3d('+swipe.index*swipe.headerEl.children[0].children[0].offsetWidth + 'px,0,0)')

      // bit of a hack specifically for transit app
      if (cb) {
        swipe.height = cb(swipe.index)
      }
      if (swipe.height !== 0) {
        h = 'height:'+swipe.height+'px;'
      }
      setTimeout(function() {
        requestAnimationFrame(function() {
          swipe.contentEl.setAttribute('style', 'transform: translate3d(-'+swipe.index*swipe.slideWidth+'px,0,0);'+h)
        })
      }, 350)
    } else if (swipe.lock === 'ios') {
      var swipedAway = false
      var absMove = Math.abs(swipe.index * swipe.slideWidth - swipe.moveX)
      if (absMove > swipe.slideWidth/2 || swipe.longTouch === false) {
        // rejects touches that don't really move
        if (Math.abs(swipe.touchStartPos - swipe.lastXPos) > 3) {
          swipedAway = true
        }
      }
      swipe.iOSBack.className = swipe.iOSBack.className + ' swipe-animate'
      if (swipedAway) {
        swipe.iOSBack.setAttribute('style', 'transform: translate3d('+swipe.slideWidth+'px,0,0);animation:none;')
      } else {
        swipe.iOSBack.setAttribute('style', 'transform: translate3d(0px,0,0);animation:none;')
      }
      // run a callback if there is one 
      if (swipe.iOSBackCb !== null) {
        swipe.iOSBackCb(swipedAway)
      }
    }
    swipe.lock = null
  }
}
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = swipe;
  }
  exports.swipe = swipe;
} else {
  window.swipe = swipe;
}