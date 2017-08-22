/*
*  I have seen this code in a few places and am not sure on the original author
*  This script fixes issues that occur with SP2010's people picker when forcing IE9+
*
*/

function ConvertEntityToSpan(ctx, entity)
{ULSGjk:;
    if(matches[ctx]==null)
        matches[ctx]=new Array();
    var key=entity.getAttribute("Key");
    var displayText=entity.getAttribute("DisplayText");
    var isResolved=entity.getAttribute("IsResolved");
    var description=entity.getAttribute("Description");
    var style='ms-entity-unresolved';
    if(isResolved=='True')
        style='ms-entity-resolved';
    var spandata="<span id='span"+STSHtmlEncode(key)+"' isContentType='true' tabindex='-1' class='"+style+"' ";
    if (browseris.ie8standard)
        spandata+="onmouseover='this.contentEditable=false;' onmouseout='this.contentEditable=true;' contentEditable='true' ";
    else
        spandata+="contentEditable='false' ";
    spandata+="title='"+STSHtmlEncode(description)+"'>"
    spandata+="<div style='display:none;' id='divEntityData' ";
    spandata+="key='"+STSHtmlEncode(key)+"' displaytext='"+STSHtmlEncode(displayText)+"' isresolved='"+STSHtmlEncode(isResolved)+"' ";
    spandata+="description='"+STSHtmlEncode(description)+"'>";
    var multipleMatches=EntityEditor_SelectSingleNode(entity, "MultipleMatches");
    matches[ctx][key]=multipleMatches;
    var extraData=EntityEditor_SelectSingleNode(entity, "ExtraData");
    if(extraData)
    {
        var data;
        if(extraData.firstChild)
            data=extraData.firstChild.xml;
        if(!data) data=extraData.innerXml || extraData.innerHTML;
        if(!data && document.implementation && document.implementation.createDocument)
        {
            var serializer=new XMLSerializer();
            data=serializer.serializeToString(extraData.firstChild);

                    // **** CUSTOM FUNCTION ****
            data = fixDataInIE9(data);
        }
        if(!data) data='';
        spandata+="<div data='"+STSHtmlEncode(data)+"'></div>";
    }
    else
    {
        spandata+="<div data=''></div>";
    }
    spandata+="</div>";
    if(PreferContentEditableDiv(ctx))
    {
        if(browseris.safari)
        {
            spandata+="<span id='content' tabindex='-1' contenteditable='false'  onmousedown='onMouseDownRw(event);' onContextMenu='onContextMenuSpnRw(event,ctx);' >";
        }
        else
        {
            spandata+="<span id='content' tabindex='-1' contenteditable onmousedown='onMouseDownRw(event);' onContextMenu='onContextMenuSpnRw(event,ctx);' >";
        }
    }
    else
    {
        spandata+="<span id='content' tabindex='-1' contenteditable onmousedown='onMouseDownRw(event);' onContextMenu='onContextMenuSpnRw(event,ctx);' >";
    }
    if (browseris.ie8standard)
        spandata+="\r";
    if(displayText !='')
        spandata+=STSHtmlEncode(displayText);
    else
        spandata+=STSHtmlEncode(key);
    if (browseris.ie8standard)
        spandata+="\r</span></span>\r";
    else
        spandata+="</span></span>";
    return spandata;
}

// **** CUSTOM FUNCTION ****
function fixDataInIE9(data)
{
    if(data.indexOf('<ArrayOfDictionaryEntry>') >= 0)
    {
        data = data.replace('<ArrayOfDictionaryEntry>', '<ArrayOfDictionaryEntry xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" xmlns:xsd=\"http://www.w3.org/2001/XMLSchema-instance\">');
    }
    return data;
}

function HandleEEReplaceForIE(clientID, key, id) {
    ULSGjk: ;
    var otherMatch = matches[clientID][key].childNodes[id];
    var spandata = ConvertEntityToSpan(clientID, otherMatch);

    //debugger;

    if (false) //here fix
    {
        //g_oSelRw.pasteHTML(spandata);
        g_oSelRw.select();
        document.selection.clear();
        InValidateControl(clientID, GetPickerControl(clientID));
    }
    else {
        var spannew = document.createElement("span");
        spannew.innerHTML = spandata;
        var div = g_oSelSpan.parentNode;
        div.replaceChild(spannew.firstChild, g_oSelSpan);
        InValidateControl(clientID, div);
        g_oSelSpan = null;
        g_oSelRw = null;
    }
}

function onClickRwIE(showMenu, divClicked, e, ctx) {
    ULSGjk: ;
    var oR = document.selection.createRange();
    var oPE = null;
    var oPPE = null;
    if (typeof (oR.parentElement) == 'function' || typeof (oR.parentElement) == 'object')
        oPE = oR.parentElement();
    else {
        var eleItem = oR.item(0);
        oPE = eleItem;
    }
    if (oPE.tagName == "SPAN" && oPE.id == "content") {
        oPPE = oPE.parentElement;
    }
    else if (oPE.tagName == "SPAN" && oPE.id.substring(0, 4) == "span" && !divClicked) {
        oPPE = oPE;
    }
    if (oPPE != null) {
        var oDivEntityData = oPPE.children('divEntityData');
        var isResolved = oDivEntityData.getAttribute('isresolved');
        oR.moveToElementText(oPPE);
        var c = "character";
        oR.moveStart(c, -1);
        if (isResolved == "False" && typeof (_fV4UI) != "undefined" && _fV4UI) {
            oR.select();
            oR.moveEnd(c, 1);
        }
        else {
            oR.moveEnd(c, 1);
            oR.select();
        }
        g_oSelRw = oR;
        if (true) //here fix
        {
            oPPE.contentEditable = false;
            g_oSelSpan = oPPE;
        }
        if (isResolved == "False") {
            var menuOwner = oPPE;
            if (menuOwner.getBoundingClientRect().right > menuOwner.parentElement.getBoundingClientRect().right)
                menuOwner = menuOwner.parentElement;
            var clientID = oPPE.parentElement.id.replace('_upLevelDiv', '');
            var keyRawValue = oDivEntityData.getAttribute('key');
            var menu = DeferCall('CMenu', 'Entity_Menu' + g_menuCounter);
            g_menuCounter++;
            var morematches = null;
            if (matches[clientID] != null && matches[clientID][keyRawValue] != null)
                morematches = matches[clientID][keyRawValue];
            var EE = document.getElementById(clientID);
            var moreItemsText = EE.getAttribute('MoreItemsText');
            var removeText = EE.getAttribute('RemoveText');
            var noMatchesText = EE.getAttribute('NoMatchesText');
            if (morematches == null || morematches.childNodes.length == 0)
                CAMOpt(menu, noMatchesText, "EENoMatchFound('" + STSScriptEncode(clientID) + "');");
            else {
                for (var x = 0; x < morematches.childNodes.length; x++) {
                    var otherMatch = morematches.childNodes[x];
                    CAMOpt(menu, otherMatch.getAttribute('DisplayText'), "EEReplace('" + STSScriptEncode(clientID) + "', '" + STSScriptEncode(keyRawValue) + "', " + x + ");");
                }
            }
            CAMSep(menu);
            CAMOpt(menu, removeText, "EERemove('" + STSScriptEncode(clientID) + "');");
            CAMOpt(menu, moreItemsText, "EEShowMore('" + STSScriptEncode(clientID) + "', '" + STSScriptEncode(keyRawValue) + "');");
            OMenu(menu, menuOwner, null, null, -1);
        }
        else {
            if (browseris.ie8standard)
                oPPE.contentEditable = false;
        }
    }
    else {
        if (browseris.ie8standard) {
            var upLevelDiv = oPE;
            while ((upLevelDiv != null) && (upLevelDiv.id == null || upLevelDiv.id.indexOf(g_EntityEditorUpLevelId) == -1))
                upLevelDiv = upLevelDiv.parentNode;
            if (upLevelDiv != null) {
                var spans = upLevelDiv.childNodes;
                for (var i = 0; i < spans.length; i++) {
                    if (spans[i].tagName != null && spans[i].tagName == "SPAN")
                        spans[i].contentEditable = true;
                }
            }
        }
    }
}
