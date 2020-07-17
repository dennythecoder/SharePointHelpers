

function simpleFetch(url, cb){
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.setRequestHeader('Accept', 'application/json;odata=verbose');
    xhr.onreadystatechange = function(){
        if(this.readyState === 4){
            cb(JSON.parse(this.response));
        }
    }
    xhr.send();
}

function getList(listName, cb){
    var url = "_vti_bin/listdata.svc/" + listName;
    try{
        var ctx = new SP.ClientContext;
        url = ctx.get_url() + url ;
    }catch(e){
        url = "/" + url ;
    }
    return simpleFetch(url, function(response){
        if(response && response.d && response.d.results){
            cb(response.d.results);
        } 
        else if(response && response.d){
            cb(response.d);
        }
         else{
            cb(response);
        }
    });
}


function getNavigationItems(cb){
    var url = '/_api/navigation/menustate?mapprovidername=%27GlobalNavigationSwitchableProvider%27';
    return simpleFetch(url, cb);
}


/******

Usage of this Vue Component:

  <sp-data list-name="Tasks" v-slot="spData">
    <div v-for="task in spData.items">
      {{task.Title}}
    </div>
  </sp-data>


****/


Vue && Vue.component('sp-data',{
    props:['listName', 'alias'],
    data:function(){
        return{
            items:[]
        }
    },
    template:'<div><slot :items="items"></slot></div>',
    mounted:function(){
        var vm = this;
        getList(vm.listName, function (items) {
            Vue.set(vm,'items',items);        
        });
    }
});

Vue && Vue.component('sp-navigation',{
    data:function(){
        return{
            items:[]
        }
    },
    template:'<div><slot :items="items"></slot></div>',
    mounted:function(){
        var vm = this;
        getNavigationItems(function(items){
            Vue.set(vm, 'items', items);
            
        });
    }
});
