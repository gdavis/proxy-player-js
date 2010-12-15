function DOMUtil(){}

DOMUtil.getWidth = function( elem ) {
  if( elem ) return elem.offsetWidth;
  else return -1;
};

DOMUtil.getHeight = function( elem ) {
  if( elem ) return elem.offsetHeight;
  else return -1;
};

DOMUtil.show = function( elem ) {
  if( elem ) elem.style.display = 'inline';
};

DOMUtil.hide = function( elem ) {
  if( elem ) elem.style.display = 'none';
};

DOMUtil.removeElement = function( elem ) {
  if( elem ) {
    if( elem.parentNode ) {
      elem.parentNode.removeChild( elem );
    }
  }
};

DOMUtil.createElement = function( type, params, parent ) {
  var type = type || params.tag, 
    prop, 
    el = document.createElement(type);

  for (prop in params) {
    if( typeof params[prop] !== 'function' ) {
        switch( prop ){
          case 'text':
            el.appendChild( document.createTextNode( params[prop] ) );
            break;
          case 'className':
            el.setAttribute( 'class', params[prop]);
            break;
          default:
            el.setAttribute( prop, params[prop] );
        }
    }
  }
  if( parent ) parent.appendChild( el );
  return el;
};

DOMUtil.getRE = function( name ) {
  return new RegExp( '\\b' + name + '\\b', 'g' );
};

DOMUtil.hasClass = function( el, name ) {
  return this.getRE( name ).test( el.className );
};

DOMUtil.addClass = function( el, name ) {
  if( !this.hasClass( el, name ) ) {
    el.className += ' ' + name;
  }
};

DOMUtil.removeClass = function( el, name ) {
  el.className = el.className.replace( this.getRE( name ), '' );
};

DOMUtil.toggleClass = function( el, name, on ) {
  if( on === undefined ) {
    on = !this.hasClass( el, name );
  }
  if( on ) {
    this.addClass( el, name );
  } else {
    this.removeClass( el, name );
  }
};