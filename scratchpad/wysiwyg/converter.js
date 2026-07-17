/* Conversor markdown <-> HTML para a edição WYSIWYG do resumo.
   mdInline/isMarkdownTableSep/mdToHtml são CÓPIA EXATA do index.html (fonte da
   verdade do render). htmlToMd é o inverso, escrito para reproduzir a mesma
   saída visual (round-trip estável) e tolerar o HTML "sujo" do contenteditable. */

function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

function mdInline(s){return esc(s).replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>').replace(/__(.+?)__/g,'<u>$1</u>').replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g,'$1<em>$2</em>').replace(/`([^`]+)`/g,'<code>$1</code>');}
function isMarkdownTableSep(line){return /^\s*\|?[\s:-]+\|[\s|:-]*$/.test(line||'');}
function mdToHtml(md){
  var lines=String(md||'').replace(/\r/g,'').split('\n');
  var out=[],list=[];
  function flushList(){
    if(list.length){out.push('<ul>'+list.map(function(x){return'<li>'+mdInline(x)+'</li>';}).join('')+'</ul>');list=[];}
  }
  for(var i=0;i<lines.length;i++){
    var line=lines[i].trim();
    if(!line){flushList();continue;}
    if(line==='---'){flushList();out.push('<hr>');continue;}
    if(isMarkdownTableSep(line))continue;
    if(line.indexOf('|')>=0&&line.split('|').filter(function(c){return c.trim();}).length>=2){
      flushList();
      var rows=[];
      while(i<lines.length&&lines[i].indexOf('|')>=0){
        if(!isMarkdownTableSep(lines[i]))rows.push(lines[i].split('|').map(function(c){return c.trim();}).filter(Boolean));
        i++;
      }
      i--;
      if(rows.length){
        var head=rows[0],body=rows.slice(1);
        out.push('<table><thead><tr>'+head.map(function(c){return'<th>'+mdInline(c)+'</th>';}).join('')+'</tr></thead><tbody>'+body.map(function(r){return'<tr>'+r.map(function(c){return'<td>'+mdInline(c)+'</td>';}).join('')+'</tr>';}).join('')+'</tbody></table>');
      }
      continue;
    }
    if(/^>\s?/.test(line)){flushList();out.push('<blockquote>'+mdInline(line.replace(/^>\s?/,''))+'</blockquote>');continue;}
    if(/^#{1,4}\s+/.test(line)){flushList();out.push('<h3>'+mdInline(line.replace(/^#{1,4}\s+/,''))+'</h3>');continue;}
    if(/^[-*]\s+/.test(line)){list.push(line.replace(/^[-*]\s+/,''));continue;}
    if(/^\d+\.\s+/.test(line)){list.push(line.replace(/^\d+\.\s+/,''));continue;}
    flushList();
    out.push('<p>'+mdInline(line)+'</p>');
  }
  flushList();
  return out.join('');
}

// ---------- inverso: HTML (do contenteditable) -> markdown ----------
function htmlToMd(root){
  var out=[];
  function styleWrap(el, inner){
    var st=(el.getAttribute&&el.getAttribute('style')||'').toLowerCase();
    if(/font-weight:\s*(bold|[6-9]00)/.test(st)) inner='**'+inner+'**';
    if(/font-style:\s*italic/.test(st)) inner='*'+inner+'*';
    if(/text-decoration:[^;]*underline/.test(st)) inner='__'+inner+'__';
    return inner;
  }
  function inline(node){
    var s='';
    var kids=node.childNodes;
    for(var i=0;i<kids.length;i++){
      var ch=kids[i];
      if(ch.nodeType===3){ s+=ch.nodeValue; continue; }
      if(ch.nodeType!==1) continue;
      var tag=ch.tagName.toLowerCase();
      var inner=inline(ch);
      if(tag==='strong'||tag==='b') s+='**'+inner+'**';
      else if(tag==='em'||tag==='i') s+='*'+inner+'*';
      else if(tag==='u'||tag==='ins') s+='__'+inner+'__';
      else if(tag==='code'||tag==='tt'||tag==='kbd') s+='`'+inner+'`';
      else if(tag==='br') s+='\n';
      else if(tag==='span'||tag==='font') s+=styleWrap(ch, inner);
      else if(tag==='a') s+=inner; // sem sintaxe de link no render atual
      else s+=inner;
    }
    return s;
  }
  function cellText(node){ return inline(node).replace(/\s+/g,' ').replace(/\|/g,'\\|').trim(); }
  function pushLine(t){ if(t!=='') out.push(t); }
  function block(node){
    if(node.nodeType===3){ var t=(node.nodeValue||'').trim(); if(t) pushLine(t); return; }
    if(node.nodeType!==1) return;
    var tag=node.tagName.toLowerCase();
    if(/^h[1-6]$/.test(tag)){ pushLine('## '+inline(node).replace(/\s+/g,' ').trim()); return; }
    if(tag==='hr'){ out.push('---'); return; }
    if(tag==='blockquote'){ pushLine('> '+inline(node).replace(/\s+/g,' ').trim()); return; }
    if(tag==='ul'||tag==='ol'){
      var items=[];
      var lis=node.children;
      for(var i=0;i<lis.length;i++){ if(lis[i].tagName&&lis[i].tagName.toLowerCase()==='li'){ var it=inline(lis[i]).replace(/\s+/g,' ').trim(); if(it) items.push('- '+it); } }
      if(items.length) out.push(items.join('\n'));
      return;
    }
    if(tag==='table'){
      var trs=node.querySelectorAll('tr'), allRows=[];
      for(var r=0;r<trs.length;r++){
        var cs=trs[r].querySelectorAll('th,td'), row=[];
        for(var cI=0;cI<cs.length;cI++) row.push(cellText(cs[cI]));
        if(row.length) allRows.push(row);
      }
      if(allRows.length){
        var header=allRows[0], w=header.length;
        var lines=['| '+header.join(' | ')+' |','| '+header.map(function(){return '---';}).join(' | ')+' |'];
        for(var b=1;b<allRows.length;b++){ var rr=allRows[b].slice(0,w); while(rr.length<w) rr.push(''); lines.push('| '+rr.join(' | ')+' |'); }
        out.push(lines.join('\n'));
      }
      return;
    }
    if(tag==='p'||tag==='div'){
      // contenteditable pode aninhar blocos (ex.: <p><ul>…</ul></p>): se houver
      // filho de bloco, recursa; senão trata como parágrafo/linha.
      var hasBlock=false, kids=node.childNodes;
      for(var k=0;k<kids.length;k++){ var c=kids[k]; if(c.nodeType===1 && /^(h[1-6]|p|ul|ol|table|hr|blockquote|div)$/.test(c.tagName.toLowerCase())){ hasBlock=true; break; } }
      if(hasBlock){ for(var k2=0;k2<kids.length;k2++) block(kids[k2]); }
      else { var dt=inline(node).replace(/\s+/g,' ').trim(); pushLine(dt); }
      return;
    }
    // desconhecido: recursa nos filhos como blocos
    var kids2=node.childNodes; var handled=false;
    for(var k3=0;k3<kids2.length;k3++){ if(kids2[k3].nodeType===1){ handled=true; } }
    if(handled){ for(var k4=0;k4<kids2.length;k4++) block(kids2[k4]); }
    else { var ut=inline(node).replace(/\s+/g,' ').trim(); pushLine(ut); }
  }
  var top=root.childNodes;
  for(var i=0;i<top.length;i++) block(top[i]);
  return out.join('\n\n').replace(/\n{3,}/g,'\n\n').trim();
}

if(typeof module!=='undefined'&&module.exports){ module.exports={mdInline:mdInline,isMarkdownTableSep:isMarkdownTableSep,mdToHtml:mdToHtml,htmlToMd:htmlToMd,esc:esc}; }
