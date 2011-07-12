Ext.apply(Ext.anims, {
    rotate: new Ext.Anim({
        autoClear: false,
        out: false,
        before: function(el) {
            var d = '';
            if (this.dir == 'ccw'){
              d = '-';
            }

            this.from = {
                '-webkit-transform': 'rotate('+d+''+this.fromAngle+'deg)'
            };

            this.to = {
                '-webkit-transform': 'rotate('+d+''+this.toAngle+'deg)'
            };
                        
        }
    })
});  

Ext.ns('mobile.plugins');

mobile.plugins.ListPullPager = Ext.extend(Ext.util.Observable, {
  langPullPrevious: 'Pull down to load previous...',
  langReleasePrevious: 'Release to load previous...',
  langPullNext: 'Pull up to load next...',
  langReleaseNext: 'Release to load next...',
  langLoading: 'Loading...',
  
  //langPullPrevious: mobilelang.getText('pullPrevious'),
  //langReleasePrevious: mobilelang.getText('releasePrevious'),
  //langPullNext: mobilelang.getText('pullNext'),
  //langReleaseNext: mobilelang.getText('releaseNext'),
  //langLoading: mobilelang.getText('loading'),
  loading: false,
  //define the functions to call for loading.
  previousFn: undefined,
  nextFn: undefined,
  // private
  init: function(cmp){
    this.cmp = cmp;

    //set these flags to true if they are left undefined in the config
    this.setPreviousEnabled(this.previousEnabled);
    this.setNextEnabled(this.nextEnabled);
    
    this.lastUpdate = new Date();
    cmp.loadingText = undefined;
    cmp.on('render', this.initPullHandler, this);
    if (!this.previousFn || !this.nextFn){
      cmp.getStore().on('load', this.reloadComplete, this);
    }
  },
  // private
  initPullHandler: function(){
    //Previous
    this.previousTpl = new Ext.XTemplate(
      '<div class="pullprevious" style="height: {h}; text-align: bottom;">'+
        '<div class="msgwrap" style="height: 75px; bottom: 0px; position: relative;">'+
          '<span class="arrow {s}"></span>'+
          '<span class="msg">{m}</span>'+
        '</div>'+
      '</div>');
    this.previousEl = this.previousTpl.insertBefore(this.cmp.scroller.el, {h:0,m:this.langPullPrevious,l:this.lastUpdate}, true);
    this.previousEl.hide();
    Ext.Element.cssTranslate(this.previousEl, {x:0, y:+75});
    //this.cmp.scroller.on('offsetchange', this.handlePrevious, this);
    
    //Next
    this.nextTpl = new Ext.XTemplate(
      '<div class="pullnext" style="height: {h}; text-align: bottom;">'+
        '<div class="msgwrap" style="height: 75px; bottom: 0px; position: relative;">'+
          '<span class="arrow {s}"></span>'+
          '<span class="msg">{m}</span>'+
        '</div>'+
      '</div>');
    this.nextEl = this.nextTpl.insertAfter(this.cmp.scroller.el, {h:0,m:this.langPullNext,l:this.lastUpdate}, true);
    this.nextEl.hide();
    Ext.Element.cssTranslate(this.nextEl, {x:0, y:-75});
    
    
    this.cmp.scroller.on('offsetchange', this.handleOffsettChange, this);
  },

  setPreviousEnabled: function(enabled) {
    if (enabled === undefined) enabled = true;
    this.previousEnabled = !!enabled;
  },
  setNextEnabled: function(enabled) {
    if (enabled === undefined) enabled = true;
    this.nextEnabled = !!enabled;
  },
  
  handleOffsettChange: function(scroller, offset) {
    if (scroller.direction === 'vertical' && !this.loading){
      
      var heightOfList = scroller.size.height - scroller.containerBox.height;
      
      if (offset.y > 0 && this.previousEnabled){
        //console.log('up');
        this.handlePrevious(scroller, offset, heightOfList);
      }
      
      if (offset.y < (heightOfList * -1) && this.nextEnabled) {
        //console.log('down');
        this.handleNext(scroller, offset, heightOfList);
      }
    }
  },
  
  //private
  handlePrevious: function(scroller, offset, heightOfList){
    if (scroller.direction === 'vertical' && !this.loading){
      if (offset){
        Ext.Element.cssTranslate(this.previousEl, {x:0, y:offset.y-75});
        if (offset.y > 75){
          // state 1
          if (this.state !== 1){
            this.prevState = this.state;
            this.state = 1;
            this.previousTpl.overwrite(this.previousEl, {h:offset.y,m:this.langReleasePrevious,l:this.lastUpdate});
            Ext.Anim.run(this.previousEl.select('.arrow').first(),'rotate',{dir:'ccw',fromAngle:0,toAngle:180});
          }
        }else if (!scroller.isDragging()){
          // state 3
          if (this.state !== 3){
            this.prevState = this.state;
            this.state = 3;
            if (this.prevState == 1){
              this.loading = true;
              this.lastUpdate = new Date();
              this.previousEl.hide();
              if (this.previousFn){
                this.previousFn.call(this,this.previousComplete,this);
              }else{
                this.cmp.getStore().load();
              }
            }
          }
        }else{
          // state 2
          if (this.state !== 2){
            this.prevState = this.state;
            this.state = 2;
            this.previousTpl.overwrite(this.previousEl, {h:offset.y,m:this.langPullPrevious,l:this.lastUpdate});
            this.previousEl.show();
            if (this.prevState == 1){
              Ext.Anim.run(this.previousEl.select('.arrow').first(),'rotate',{dir:'cw',fromAngle:180,toAngle:0});
            }
          }
        }
      }
    }
  },
  handleNext: function(scroller, offset, heightOfList){
    if (scroller.direction === 'vertical' && !this.loading){
      if (offset){
        Ext.Element.cssTranslate(this.nextEl, {x:0, y:offset.y});
        if (offset.y < ((heightOfList + 75)*-1)){
          // state 1
          if (this.state !== 1){
            this.prevState = this.state;
            this.state = 1;
            this.nextTpl.overwrite(this.nextEl, {h:offset.y,m:this.langReleaseNext,l:this.lastUpdate});
            Ext.Anim.run(this.nextEl.select('.arrow').first(),'rotate',{dir:'ccw',fromAngle:180,toAngle:0});
          }
        }else if (!scroller.isDragging()){
          // state 3
          if (this.state !== 3){
            this.prevState = this.state;
            this.state = 3;
            if (this.prevState == 1){
              this.loading = true;
              this.lastUpdate = new Date();
              this.nextEl.hide();
              if (this.nextFn){
                this.nextFn.call(this,this.nextComplete,this);
              }else{
                this.cmp.getStore().load();
              }
            }
          }
        }else{
          // state 2
          if (this.state !== 2){
            this.prevState = this.state;
            this.state = 2;
            this.nextTpl.overwrite(this.nextEl, {h:offset.y,m:this.langPullNext,l:this.lastUpdate});
            this.nextEl.show();
            if (this.prevState == 1){
              Ext.Anim.run(this.nextEl.select('.arrow').first(),'rotate',{dir:'cw',fromAngle:180,toAngle:0});
            }
          }
        }
      }
    }
  },
  //private
  previousComplete: function(){
    this.loading = false;
    this.lastUpdate = new Date();
    this.previousTpl.overwrite(this.previousEl, {h:0,m:this.langPullPrevious,l:this.lastUpdate});
  },
  nextComplete: function(){
    this.loading = false;
    this.lastUpdate = new Date();
    this.nextTpl.overwrite(this.nextEl, {h:0,m:this.langPullNext,l:this.lastUpdate});
  }
});

Ext.preg('listpullpager', mobile.plugins.ListPullPager);