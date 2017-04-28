var http = require('http');
var fs = require('fs');
var path = require('path');
var cheerio = require('cheerio');
var stream = require('stream');


getData('http://blog.fens.me/series-nodejs/',getLinks);

function getData(url,callback){
	var pathName = url.split('/');
	var lastPath = pathName[pathName.length-1];
	if(lastPath && lastPath.indexOf('.') < 0 && lastPath.indexOf('/') < 0){
		url = url+'/';
	}
	http.get(url,function(res){
		var html = '';
		res.on('data',function(data){
			html += data;
		}).on('end',function(){
			callback && callback(html);
		}).on('error',function(error){
			console.log(1);
		});
		// var rs = new stream.Readable;
		// rs.push('res');
		// rs.push(null);
		// rs.pipe(cws)
		// cws.end();
	}).on('error',function(error){
		console.log(url+'...fail...repeat');
		getData(url,callback);
	});
}


function mkdir(str){
	str.split('/').forEach(function(dir,index,splits){
		var parent = splits.slice(0,index+1).join('/');
		var dirPath = path.resolve(__dirname, parent);
		if (!fs.existsSync(dirPath)) {
			if(index == splits.length-1){
				if(dir.indexOf('.') < 0){
					fs.mkdirSync(dirPath);
				}
			}else{
				fs.mkdirSync(dirPath);
			}
		}
	});
	return str;
}

function getLinks(html){
	var $ = cheerio.load(html);
	var h2s = $('.entry > h2');
	
	var data = [];
	var menu = [];
	var index = 1;
	for(var i = 0; i < h2s.length; i++){
		var links = h2s.eq(i).nextUntil('h2','p').find('a');
		menu.push(h2s.eq(i).text());
		for(var n = 0; n < links.length; n++){
			var href = links.eq(n).attr('href');
			var text = links.eq(n).text();
			data.push(href);
			menu.push((index++)+'.'+text+':'+href);
		}
	}
	
	getLists(data);
	writeFile('menu',menu.join('\n\n'));
	console.log('目录...ok\n');
}

function writeFile(filename,data){
	var dist = mkdir('./data/'+filename.replace(/[\s|]/g,'')+'.html');

	var cws = fs.createWriteStream(dist);
	cws.write(data);
	cws.end();
}

function getLists(urls){
	var index = 1;
	urls.forEach(function(item){
		getData(item,function(html){
			var $ = cheerio.load(html);
			var title = $('title').text().replace(/粉丝日志/g,'');
			writeFile(title,html);
			console.log((index++)+'.'+title+'...ok\n');
		});
	})
	
}
