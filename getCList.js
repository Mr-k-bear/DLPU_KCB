
// 课表数据
let cList = [];
let dHead = [];
let tHead = [];
let prList = [];
let tList = [];

// 专业课程书统计
let preClassNum = [];

// 统计老师课程
let teaClassNum = [];

// 统计上课地点
let locateNum = [];

// 获取课表全部tr
let trArr = document.querySelector("#kbtable > tbody").getElementsByTagName("tr");

// 解析星期表头
let dhom = trArr[0].getElementsByTagName("th");
for(let i = 1; i < dhom.length; i++)
dHead = dHead.concat(new Array(6).fill(dhom[i].innerHTML));


// 解析课节表头
let thom = trArr[1].getElementsByTagName("td");
for(let i = 1; i < thom.length; i++)
tHead.push([thom[i].innerHTML.substr(0,2)/1, thom[i].innerHTML.substr(2,2)/1]);


// 正式解析全部课程
for(let i = 2; i < trArr.length; i++){

	let tdArr = trArr[i].getElementsByTagName("td");

	// 这里获取课程名称
	let cName = tdArr[0].getElementsByTagName("nobr")[0].innerHTML;

	// 展开解析班级课表
	for(let j = 1; j < tdArr.length; j++){

		// 获取内部课程列表
		let ncList = tdArr[j].getElementsByTagName("nobr")[0].getElementsByTagName("div");

		// 如果该格子内没有课程跳过
		if(ncList.length <= 0) continue;

		// 获取星期
		let ncDay = dHead[j-1];

		// 获取课节
		let ncTime = tHead[j-1];

		// 记录上课班级，防止重复记录
		let clList = [];

		// 记录上课老师，防止重复记录
		let teList = [];

		// 记录上课地点，防止重复记录
		let loList = [];

		// 获取每节课内容
		for(let k = 0; k < ncList.length; k++){

			// 获取信息列表
			let detaList = ncList[k].innerHTML.split(/\s*<br>\s*/);

			// 获取班级列表和专业
			let classList = []; // let press = [];
			detaList[0].split(",").map((v)=>{
				let ccc = parseClass(v);

				// 获取专业
				prList.push(ccc[0]);

				// 添加班级列表
				for(let f = 0; f < ccc[1].length; f++){
					classList.push(ccc[1][f]);
					let ccclas = get(clList, ccc[1][f]);
					ccclas[1]++;
				}
				
			});

			// 获取老师时间
			let teacherTime = detaList[1].split("\n");

			// 老师列表
			let teacherList = teacherTime[0].split(",");
			for(let f = 0; f < teacherList.length; f++){
				tList.push(teacherList[f]);
				let cctea = get(teList, teacherList[f]);
				cctea[1]++;
			}

			// 时间
			let time = parseWeek(teacherTime[1].replace(/(\()|(\))|(（)|(）)/g,""));

			// 获取一共要上几周
			let weekNum = 0;
			time.map((v)=> weekNum += v);

			// 获取专业
			// let press = classList[0].replace(/(\d)|(\s)|(班)|(\-)/g,"");
			// prList.push(press);

			// 获取地点
			let locate = detaList[2] || "";
			locate = locate.replace(/\s/, "");

			// 整理数据
			let d = {
				n: cName,
				c: classList,
				w: time,
				e: weekNum,
				d: ncDay,
				k: ncTime,
				t: teacherList,
				// p: press,
				l: locate
			};

			// 统计班级课程
			d.c.map((v)=>{

				// 如果该格子内存在该班级 放弃统计
				if(get(clList, v)[1] > 1) return;

				let clasNumNode = get(preClassNum, v);
				clasNumNode[1] += d.e;
			});

			// 统计老师课程
			d.t.map((v)=>{

				// 如果该格子内存在该班级 放弃统计
				if(get(teList, v)[1] > 1) return;

				let teaNumNode = get(teaClassNum, v);
				teaNumNode[1] += d.e;
			});

			// 记录上课地点loList
			if(get(teList, d.l)[1] <= 1){
				let loacteNumNodeNS = get(teList, d.l)
				loacteNumNodeNS[1] ++;
				let loacteNumNode = get(locateNum, d.l)
				loacteNumNode[1] += d.e;
			}
			

			// 记录
			cList.push(d);

		}
		
	}
}

prList = [... new Set(prList)];
tList = [... new Set(tList)];
preClassNum = preClassNum.sort((a,b)=>b[1]-a[1]);
teaClassNum = teaClassNum.sort((a,b)=>b[1]-a[1]);
locateNum = locateNum.sort((a,b)=>b[1]-a[1]);

// 按专业分类计算平均值
let ppClassNum = [];

// 执行计算
preClassNum.map((v)=>{

	// 获取专业名字
	let press = v[0].replace(/(\d)|(\s)|(班)|(\-)/g,"");

	// 获取列表对象
	let pp = get(ppClassNum, press);

	// 累计数值
	pp[1]++;

	// 创建积分值
	pp[2] = pp[2] ? pp[2] : 0;

	// 积分
	pp[2] += v[1];
});

// 统计专业课程
let ppCList = [];

// 统计专业课程
cList.map((v)=>{

	// 获取专业列表
	let ppList = v.c.map((v)=>v.replace(/\d/g, ""));

	// 遍历涉及专业
	[... new Set(ppList)].map((d)=>{
		
		// 获取当前记录专业
		let pp = get(ppCList, d);
		
		// 如果没有创建数组存储
		if(pp[1] === 0) pp[1] = [];

		// 获取课程数组
		let pc = get(pp[1], v.n);

		// 记录
		if(!pc[2]) pc[2] = [];

		// 课程积分
		pc[1] += v.e;

		// 记录周课节
		v.w.map((f, i)=>{

			// 填充周节数
			if(pc[2].length < v.w.length) pc[2] = pc[2]
			.concat(new Array(v.w.length - pc[2].length).fill(0));

			// 记录
			pc[2][i] += f;
		});
	});
	
});

// 计算平均值
ppClassNum = ppClassNum.map((v)=>{
	v[1] = Math.floor(v[2] / v[1]);
	v.length = 2;
	return v;
})

// 逐周采样
let pCList = [];

// 对每个专业进行逐周采样
ppCList.map((v)=>{
	
	let allWeek = [];

	for(let i = 0; i < 20; i++){
	
		// 采样结果
		let cres = [0];

		v[1].map((d)=>{
		
			if(d[2][i]){
				cres.push(d[0]);
				cres[0] += d[2][i];
			}

		});

		allWeek.push(cres);
	
	}

	// 从最后一周开始，向前清理
	let hasClass = false;
	for(let i = allWeek.length - 1; i >= 0; i--){
		hasClass = allWeek[i][0];
		if(hasClass) break;
		allWeek.length--;
	}

	// 过滤 [0]
	allWeek = allWeek.map((v)=>(v[0]===0 && v.length === 1) ? false : v);

	// 按权重分配节数
	let totalNum = 0; sum = 0;
	allWeek.map((v)=>{
		if(!v) return false;
		totalNum++;
		sum += v[0];
	});

	// 获取平均专业课程数量
	let ppNum = get(ppClassNum, v[0])[1];

	// 按权重分配课程
	allWeek.map((v)=>{
		v[0] = ppNum * v[0]/sum;
	});

	pCList.push([v[0], allWeek]);

});

// 排序专业分类计算平均值
ppClassNum = ppClassNum.sort((a,b)=>b[1]-a[1]);

// 专业对应学院
let NVA = JSON.parse(`{
	"\u827A\u79D1\uFF08\u5B9E\u9A8C\uFF09": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u673A\u68B0\u7C7B": "\u673A\u68B0\u5DE5\u7A0B\u4E0E\u81EA\u52A8\u5316\u5B66\u9662",
	"\u7535\u4FE1": "\u4FE1\u606F\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u5B66\u9662",
	"\u8BA1\u7B97\u673A": "\u4FE1\u606F\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u5B66\u9662",
	"\u7F51\u7EDC": "\u4FE1\u606F\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u5B66\u9662",
	"\u901A\u4FE1": "\u4FE1\u606F\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u5B66\u9662",
	"\u7167\u660E": "\u4FE1\u606F\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u5B66\u9662",
	"\u6D77\u6D0B": "\u98DF\u54C1\u5B66\u9662",
	"\u5927\u6570\u636E": "\u7BA1\u7406\u5B66\u9662",
	"\u81EA\u52A8\u5316": "\u4FE1\u606F\u79D1\u5B66\u4E0E\u5DE5\u7A0B\u5B66\u9662",
	"\u751F\u6280": "\u751F\u7269\u5DE5\u7A0B\u5B66\u9662",
	"\u673A\u7535\uFF08\u4E2D\u5916\u5408\u4F5C\uFF09": "\u673A\u68B0\u5DE5\u7A0B\u4E0E\u81EA\u52A8\u5316\u5B66\u9662",
	"\u5E94\u5316": "\u8F7B\u5DE5\u4E0E\u5316\u5B66\u5DE5\u7A0B\u5B66\u9662",
	"\u6570\u6280": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u670D\u5DE5": "\u670D\u88C5\u5B66\u9662",
	"\u8868\u6F14": "\u670D\u88C5\u5B66\u9662",
	"\u98DF\u8D28": "\u98DF\u54C1\u5B66\u9662",
	"\u98DF\u54C1": "\u98DF\u54C1\u5B66\u9662",
	"\u8F7B\u5316": "\u8F7B\u5DE5\u4E0E\u5316\u5B66\u5DE5\u7A0B\u5B66\u9662",
	"\u827A\u79D1": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u8461\u5DE5": "\u751F\u7269\u5DE5\u7A0B\u5B66\u9662",
	"\u65E5\u8BED": "\u5916\u56FD\u8BED\u5B66\u9662",
	"\u5DE5\u4E1A": "\u673A\u68B0\u5DE5\u7A0B\u4E0E\u81EA\u52A8\u5316\u5B66\u9662",
	"\u5316\u5DE5": "\u8F7B\u5DE5\u4E0E\u5316\u5B66\u5DE5\u7A0B\u5B66\u9662",
	"\u670D\u88C5": "\u670D\u88C5\u5B66\u9662",
	"\u65E0\u673A": "\u7EBA\u7EC7\u4E0E\u6750\u6599\u5DE5\u7A0B\u5B66\u9662",
	"\u670D\u8BBE\uFF08\u4E2D\u5916\u5408\u4F5C\uFF09": "\u5357\u5B89\u666E\u987F\u56FD\u9645\u5B66\u9662",
	"\u5305\u88C5": "\u8F7B\u5DE5\u4E0E\u5316\u5B66\u5DE5\u7A0B\u5B66\u9662",
	"\u7F8E\u672F\u5B66": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u89C6\u4F20\uFF08\u4E2D\u5916\u5408\u4F5C\uFF09": "\u5357\u5B89\u666E\u987F\u56FD\u9645\u5B66\u9662",
	"\u82F1\u8BED": "\u5916\u56FD\u8BED\u5B66\u9662",
	"\u73AF\u5DE5": "\u8F7B\u5DE5\u4E0E\u5316\u5B66\u5DE5\u7A0B\u5B66\u9662",
	"\u9AD8\u5206\u5B50": "\u7EBA\u7EC7\u4E0E\u6750\u6599\u5DE5\u7A0B\u5B66\u9662",
	"\u751F\u5DE5": "\u751F\u7269\u5DE5\u7A0B\u5B66\u9662",
	"\u7EBA\u7EC7": "\u7EBA\u7EC7\u4E0E\u6750\u6599\u5DE5\u7A0B\u5B66\u9662",
	"\u4EA7\u54C1": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u89C6\u4F20": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u4EBA\u529B": "\u7BA1\u7406\u5B66\u9662",
	"\u6570\u5A92\uFF08\u4E13\u5347\u672C\uFF09": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u56ED\u6797": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u73AF\u8BBE": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u7269\u6D41": "\u7BA1\u7406\u5B66\u9662",
	"\u4EA7\u54C1\uFF08\u4E2D\u672C\uFF09": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u5DE5\u5546": "\u7BA1\u7406\u5B66\u9662",
	"\u89C6\u4F20\uFF08\u4E2D\u672C\uFF09": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u73AF\u8BBE\uFF08\u4E13\u5347\u672C\uFF09": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u6444\u5F71": "\u670D\u88C5\u5B66\u9662",
	"\u6750\u63A7": "\u673A\u68B0\u5DE5\u7A0B\u4E0E\u81EA\u52A8\u5316\u5B66\u9662",
	"\u670D\u88C5\uFF08\u4E2D\u672C\uFF09": "\u670D\u88C5\u5B66\u9662",
	"\u673A\u7535": "\u673A\u68B0\u5DE5\u7A0B\u4E0E\u81EA\u52A8\u5316\u5B66\u9662",
	"\u96D5\u5851": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u8BBE\u8BA1\u5B66": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662",
	"\u673A\u68B0": "\u673A\u68B0\u5DE5\u7A0B\u4E0E\u81EA\u52A8\u5316\u5B66\u9662",
	"\u6C49\u8BED": "\u5916\u56FD\u8BED\u5B66\u9662",
	"\u56FD\u8D38": "\u7BA1\u7406\u5B66\u9662",
	"\u4FE1\u7BA1": "\u7BA1\u7406\u5B66\u9662",
	"\u4E34": "\u672A\u77E5",
	"\u6570\u5A92": "\u827A\u672F\u8BBE\u8BA1\u5B66\u9662"
}`);


// 学院统计
let xyClassNum = [];

ppClassNum.map((v)=>{

	// 获取专业名字
	let press = NVA[v[0]];

	if(!press) console.log(v[0]);

	// 获取列表对象
	let pp = get(xyClassNum, press);

	// 累计数值
	pp[1]++;

	// 创建积分值
	pp[2] = pp[2] ? pp[2] : 0;

	// 积分
	pp[2] += v[1];
});

// 计算平均值
xyClassNum = xyClassNum.map((v)=>{
	v[1] = Math.floor(v[2] / v[1]);
	v.length = 2;
	return v;
})

// 排序学院统计算平均值
xyClassNum = xyClassNum.sort((a,b)=>b[1]-a[1]);


"执行完毕！！！";

function get(d, n){

	let find = null;
	for(let i = 0; i < d.length; i++){
		if(d[i][0] == n) find = d[i];
	}

	if(find) return find;

	let g = [n, 0];
	d.push(g);

	return g;
}

function parseClass(s){
	
	// 去掉字符末尾的班
	s = s.replace(/班/g,"");

	// 获取班级
	let press = s.replace(/(\d)|(\s)|(班)|(\-)/g,"");

	// 尝试匹配正则
	match = s.match(/\d+-\d+/);

	// 没有找到 直接返回
	if(!match) return [press, [s]];

	// 找到了
	let clas = match[0].split("-");

	// 教务处错误数据
	if(clas[1].length >= 4){
		// console.log(s);
		clas[1] = clas[1].substr(-2);
	}

	// 遍历
	let cl = []; let i = 0;
	while(clas[0]/1+i < clas[0]/1 + clas[1]/1){
		cl.push(press + (clas[0]/1+i));
		i++;
	}

	return [press, cl];
	
}

function parseWeek(s){
  
  // 检测模式
  let mod = 0; let maxWeek = 0;
  let weekRES = [,/周$/,/双周$/,/单周$/];
  weekRES.map((v, i)=>{if(v && v.test(s)) mod = i});

  // 去除(周)
  s = s.replace(weekRES[mod], "");

  // 解析为稀疏数组
  let sparseArray = [];
  s.split(",").map((v)=>{
    v = v.split("-");
    if (v.length === 1) v.push(v[0]);
    maxWeek = maxWeek > v[1]/1 ? maxWeek : v[1]/1;
    for(let i = v[0]-1; i < v[1]; i++) sparseArray.push(i);
  });

  // 将稀疏数组转换为布尔数据
  let week = new Array(maxWeek).fill(0);
  sparseArray.map((v)=>week[v] = 1);

  // 处理双周情况
  if(mod === 2) week = week.map((v, i)=>i%2 && v);

  //处理单周情况
  if(mod === 3) week = week.map((v, i)=>(i+1)%2 && v);

  return week;
}