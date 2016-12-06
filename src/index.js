import xtag from 'x-tag'
import header from './header'
import pane from './pane'

xtag.register('swipeview-header-container', header.container)
xtag.register('swipeview-header-item', header.item)
xtag.register('swipeview-pane-container', pane.container)
xtag.register('swipeview-pane-item', pane.item)

xtag.register('swipeview-container', {
  lifecycle: {
    created: function(){
      let jono = this.innerHTML
      console.log('hi man')
      console.log(jono)
      jono += 'yo'
      // this.innerHTML = ''
      // setTimeout(() => {
      //   this.innerHTML = jono
      // }, 1000)
    }
  },
  methods: {
    start: function(){
      console.log(this)
      console.log('i love')
      // this.update();
      // this.xtag.interval = setInterval(this.update.bind(this), 1000);
    },
    stop: function(){
      // this.xtag.interval = clearInterval(this.xtag.interval);
    },
    update: function(){
      // this.textContent = new Date().toLocaleTimeString();
    }
  },
  events: {
    tap: function(){
      console.log('clicked!')
    }
  }
})