(
  function()
  {
    this.add=function() // node name, text, pairs of attribute name and attribute values
    {
      if(arguments[0])
      {
        var ele=this.ownerDocument.createElement(arguments[0]);
        var prop='', i=2;
        for(; arguments[i] && arguments[i+1]; i+=2)
        {
          ele[arguments[i]]=arguments[i+1];
        }
        if(arguments[1]) ele.appendChild(this.ownerDocument.createTextNode(arguments[1]));
        this.appendChild(ele);
        return ele;
      }
      else
      {
        this.appendChild(this.ownerDocument.createTextNode(arguments[1]));
      }
    }
    this.addClass=function(name)
    {
      this.className=(this.className?this.className+' ':'')+name;
    }
    this.removeClass=function(name)
    {
      this.className=this.className.replace((new RegExp('^'+name+' ?| ?'+name)),'');
    }
    this.transform=function(pattern, context)
    {
      var childs=this.childNodes, child=null, i=0;
      for( ; child=childs[i]; i++)
      {
        pattern(child, context);
      }
    }
    this.getElementsfirstChildNodeValue=function(nodeName)
    {
      var value=null;
      var ele=this.getElementsByTagName(nodeName)[0];
      if(ele && (value=ele.firstChild)) return value.nodeValue;
      return null;
    }
  }
).apply(Element.prototype);


var cookie=
{
  set: function(name, value, time) 
  {
    if(!time) time=360*24*60*60*1000;
    document.cookie = name+"="+encodeURIComponent(value)+
      "; expires="+(new Date(new Date().getTime()+time)).toGMTString()+"; path=/";
  },

  get: function(name) 
  {
    if( new RegExp(name+'\=([^;]*);','').test(document.cookie+';') ) return decodeURIComponent(RegExp.$1);
    return null;
  },

  clear:function(name) 
  {
    setCookie(name, '', -1000);
  }
}

