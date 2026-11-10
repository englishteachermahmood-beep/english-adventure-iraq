/* Administrator-only UI; Firestore Rules, not this UI, enforce access. */
const $=id=>document.getElementById(id);
const cfg=window.EAI_FIREBASE_CONFIG;
const configured=cfg && cfg.apiKey && cfg.appId && cfg.projectId;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const BOOK=window.EAI_SEED_DATA?.units||[],SEED=window.EAI_SEED_DATA?.lessons||{};
const BOOK2=window.EAI_GRADE2_SEED_DATA?.units||[],SEED2=window.EAI_GRADE2_SEED_DATA?.lessons||{};
const BOOK3=window.EAI_GRADE3_SEED_DATA?.units||[],SEED3=window.EAI_GRADE3_SEED_DATA?.lessons||{};
const BOOK4=window.EAI_GRADE4_SEED_DATA?.units||[],SEED4=window.EAI_GRADE4_SEED_DATA?.lessons||{};
/* v0.25: embedded emergency copies for Grades 5 and 6. A missing/outdated seed-data.js
   must never cause a false "0 imported" success. All other grades remain unchanged. */
const UPPER_GRADE_5_FALLBACK={"units":[{"id":1,"title":"Where are you from?"},{"id":2,"title":"Routines and animals"},{"id":3,"title":"Sports"},{"id":4,"title":"Revision"},{"id":5,"title":"Food and drink"},{"id":6,"title":"Where is it?"},{"id":7,"title":"Seasons and holidays"},{"id":8,"title":"Revision"}],"lessons":{"1":[{"id":1,"title":"Countries around us","ar":"الدول من حولنا","icon":"🌍","words":[["Iraq","🇮🇶"],["Japan","🇯🇵"],["Egypt","🇪🇬"],["France","🇫🇷"],["England","🏴"],["Turkey","🇹🇷"],["Thailand","🇹🇭"],["Italy","🇮🇹"]],"sentences":["I am from Iraq.","Where are you from?"]},{"id":2,"title":"Nationalities","ar":"الجنسيات","icon":"🪪","words":[["Iraqi","🇮🇶"],["Japanese","🇯🇵"],["Egyptian","🇪🇬"],["French","🇫🇷"],["English","🏴"],["Turkish","🇹🇷"],["Thai","🇹🇭"],["Italian","🇮🇹"]],"sentences":["I am Iraqi.","He is French.","She is Japanese."]},{"id":3,"title":"Country information","ar":"معلومات عن الدول","icon":"🗺️","words":[["country","🌍"],["capital","🏛️"],["flag","🚩"],["language","🔤"],["palace","🏰"],["costume","👘"],["Internet","🌐"],["study","📖"]],"sentences":["Baghdad is the capital of Iraq.","I want to learn English."]},{"id":4,"title":"Around the world","ar":"رحلة حول العالم","icon":"✈️","words":[["China","🇨🇳"],["panda","🐼"],["elephant","🐘"],["kangaroo","🦘"],["curry","🍛"],["famous","⭐"],["beautiful","🌺"],["interesting","💡"]],"sentences":["Where are pandas from?","They are from China."]}],"2":[{"id":1,"title":"My daily routine","ar":"روتيني اليومي","icon":"🕒","words":[["clean","🧹"],["wash clothes","🧺"],["cook","👩‍🍳"],["watch TV","📺"],["help","🤲"],["see friends","👫"],["go shopping","🛍️"],["morning","🌅"]],"sentences":["I wash clothes on Tuesday.","I help my family."]},{"id":2,"title":"Telling the time","ar":"التعبير عن الوقت","icon":"⏰","words":[["seven forty-five","🕢"],["twelve o’clock","🕛"],["nine thirty","🕤"],["Tuesday","📅"],["morning","🌅"],["afternoon","🌇"],["finish school","🏫"],["time","⌚"]],"sentences":["What time do you finish school?","I finish school at twelve thirty."]},{"id":3,"title":"Insects","ar":"الحشرات","icon":"🐞","words":[["butterfly","🦋"],["ant","🐜"],["fly","🪰"],["caterpillar","🐛"],["ladybird","🐞"],["bee","🐝"],["spider","🕷️"],["colony","🐜 🔹"]],"sentences":["Insects are part of our life."]},{"id":4,"title":"Animal world","ar":"عالم الحيوانات","icon":"🐬","words":[["dolphin","🐬"],["horse","🐴"],["shark","🦈"],["dove","🕊️"],["cage","🪤"],["feed","🥣"],["dangerous","⚠️"],["playful","🐶"]],"sentences":["A shark is dangerous.","A dolphin is playful."]}],"3":[{"id":1,"title":"Play sports","ar":"مارس الرياضة","icon":"🏅","words":[["tennis","🎾"],["boxing","🥊"],["karate","🥋"],["cycling","🚴"],["swimming","🏊"],["football","⚽"],["gymnastics","🤸"],["rowing","🚣"]],"sentences":["I like swimming and tennis.","I play football."]},{"id":2,"title":"Team sports","ar":"الرياضات الجماعية","icon":"🏀","words":[["basketball","🏀"],["team","👥"],["rules","📋"],["keep healthy","💪"],["make friends","🤝"],["learn","📚"],["play outside","🏞️"],["fun","🎉"]],"sentences":["I play outside.","Sports help me keep healthy."]},{"id":3,"title":"At the weekend","ar":"في عطلة الأسبوع","icon":"🎬","words":[["cinema","🎬"],["museum","🏛️"],["park","🌳"],["picnic","🧺"],["film","🎞️"],["friends","🧑‍🤝‍🧑"],["home","🏠"],["weekend","📆"]],"sentences":["I go to the cinema at the weekend."]},{"id":4,"title":"How often?","ar":"كم مرة؟","icon":"📅","words":[["always","♾️"],["often","🔁"],["sometimes","🌓"],["never","⛔"],["once a day","1️⃣"],["twice a week","2️⃣"],["three times a month","3️⃣"],["everybody","👥"]],"sentences":["How often do you play football?","I often go swimming."]}],"4":[{"id":1,"title":"Countries review","ar":"مراجعة البلدان","icon":"🌎","words":[["Iraq","🇮🇶"],["Italy","🇮🇹"],["Japan","🇯🇵"],["Egypt","🇪🇬"],["Iraqi","🇮🇶 🪪"],["French","🇫🇷"],["flag","🚩"],["capital","🏛️"]],"sentences":["Where are you from?","I am from Iraq."]},{"id":2,"title":"Routines review","ar":"مراجعة الروتين","icon":"⏰","words":[["clean","🧹"],["cook","👩‍🍳"],["watch TV","📺"],["wash clothes","🧺"],["Tuesday","📅"],["morning","🌅"],["help","🤲"],["time","⌚"]],"sentences":["I cook on Monday."]},{"id":3,"title":"Animals review","ar":"مراجعة الحيوانات","icon":"🐾","words":[["butterfly","🦋"],["bee","🐝"],["spider","🕷️"],["dolphin","🐬"],["shark","🦈"],["horse","🐴"],["playful","🐶"],["dangerous","⚠️"]],"sentences":["A dolphin is playful."]},{"id":4,"title":"Sports review","ar":"مراجعة الرياضة","icon":"🏆","words":[["football","⚽"],["tennis","🎾"],["swimming","🏊"],["cycling","🚴"],["basketball","🏀"],["always","♾️"],["often","🔁"],["never","⛔"]],"sentences":["I play football at the weekend."]}],"5":[{"id":1,"title":"Food and drink","ar":"الطعام والشراب","icon":"🍞","words":[["water","💧"],["bread","🍞"],["fish","🐟"],["milk","🥛"],["rice","🍚"],["chicken","🍗"],["meat","🥩"],["egg","🥚"]],"sentences":["Do you like fish?","Yes, I do."]},{"id":2,"title":"Fruit and vegetables","ar":"الفاكهة والخضراوات","icon":"🍒","words":[["strawberries","🍓"],["apples","🍎"],["cherries","🍒"],["cucumber","🥒"],["onion","🧅"],["potato","🥔"],["tomato","🍅"],["carrot","🥕"]],"sentences":["Are there any cherries?","Yes, there are."]},{"id":3,"title":"Food containers","ar":"عبوات الطعام","icon":"🧃","words":[["tin","🥫"],["box","📦"],["cup","☕"],["bottle","🍶"],["packet","📦 🔹"],["bag","🛍️"],["salad","🥗"],["lettuce","🥬"]],"sentences":["Can I have two bags of rice?","I would like some salad."]},{"id":4,"title":"Healthy habits","ar":"العادات الصحية","icon":"💚","words":[["vegetables","🥦"],["exercise","🏃"],["sleep","😴"],["water","💧"],["sweets","🍬"],["cakes","🧁"],["biscuits","🍪"],["computer games","🎮"]],"sentences":["Drink enough water.","Eat lots of vegetables."]}],"6":[{"id":1,"title":"In the shopping street","ar":"في شارع التسوق","icon":"🏪","words":[["clothes shop","👗"],["butcher’s","🥩"],["shoe shop","👟"],["pharmacy","💊"],["toy shop","🧸"],["bakery","🥖"],["bank","🏦"],["fruit stall","🍎"]],"sentences":["Where is the shoe shop?","It is next to the butcher’s."]},{"id":2,"title":"Finding places","ar":"تحديد الأماكن","icon":"📍","words":[["behind","⬅️"],["next to","↔️"],["opposite","↕️"],["between","⏺️"],["in","📥"],["on","🔝"],["at","📍"],["street","🛣️"]],"sentences":["It is opposite the butcher’s.","It is on Green Street."]},{"id":3,"title":"Fun city","ar":"مدينة الألعاب","icon":"🎡","words":[["roller coaster","🎢"],["bumper cars","🚗"],["merry-go-round","🎠"],["big wheel","🎡"],["super slide","🛝"],["super swing","🎪"],["clown","🤡"],["ride","🎟️"]],"sentences":["Let’s go to the fun city."]},{"id":4,"title":"Buying souvenirs","ar":"شراء التذكارات","icon":"🎁","words":[["postcard","💌"],["mug","☕"],["T-shirt","👕"],["key ring","🗝️"],["baseball cap","🧢"],["doll","🪆"],["souvenir","🎁"],["shop","🏪"]],"sentences":["I would like to buy a postcard."]}],"7":[{"id":1,"title":"The four seasons","ar":"فصول السنة الأربعة","icon":"🍂","words":[["winter","❄️"],["spring","🌷"],["summer","☀️"],["autumn","🍂"],["snow","🌨️"],["sun","☀️ 🔹"],["rain","🌧️"],["leaves","🍃"]],"sentences":["What is the weather like in spring?","It is mild."]},{"id":2,"title":"The weather","ar":"الطقس","icon":"🌦️","words":[["sunny","☀️"],["hot","🌡️"],["dry","🏜️"],["cold","🥶"],["rainy","🌧️"],["cloudy","☁️"],["cool","🌬️"],["windy","💨"]],"sentences":["It was sunny and hot.","It is cold and rainy."]},{"id":3,"title":"Travelling","ar":"السفر","icon":"🧳","words":[["plane","✈️"],["train","🚆"],["car","🚗"],["ferry","⛴️"],["boat","⛵"],["flight","🛫"],["airport","🛬"],["holiday","🏖️"]],"sentences":["We went to the airport.","We travelled by plane."]},{"id":4,"title":"Holiday places","ar":"أماكن العطلة","icon":"🏖️","words":[["mountains","⛰️"],["marshes","🌾"],["beach","🏝️"],["market","🛒"],["photos","📸"],["travel","🧳"],["warm","🌞"],["humid","💦"]],"sentences":["I went to the beach.","We took photos on holiday."]}],"8":[{"id":1,"title":"World and animals","ar":"البلدان والحيوانات","icon":"🌍","words":[["Japan","🇯🇵"],["Egypt","🇪🇬"],["Iraq","🇮🇶"],["dolphin","🐬"],["butterfly","🦋"],["shark","🦈"],["panda","🐼"],["elephant","🐘"]],"sentences":["Where are you from?"]},{"id":2,"title":"Sports and activities","ar":"الرياضة والأنشطة","icon":"⚽","words":[["swimming","🏊"],["football","⚽"],["tennis","🎾"],["cycling","🚴"],["always","♾️"],["sometimes","🌓"],["picnic","🧺"],["museum","🏛️"]],"sentences":["How often do you play football?"]},{"id":3,"title":"Food and places","ar":"الطعام والأماكن","icon":"🍎","words":[["cherries","🍒"],["rice","🍚"],["salad","🥗"],["water","💧"],["pharmacy","💊"],["bakery","🥖"],["bank","🏦"],["postcard","💌"]],"sentences":["Would you like some salad?"]},{"id":4,"title":"Seasons and travel","ar":"الفصول والسفر","icon":"🌈","words":[["spring","🌷"],["summer","☀️"],["winter","❄️"],["autumn","🍂"],["airport","🛬"],["plane","✈️"],["beach","🏝️"],["marshes","🌾"]],"sentences":["It was sunny on holiday."]}]}};
const UPPER_GRADE_6_FALLBACK={"units":[{"id":1,"title":"Jobs and places of work"},{"id":2,"title":"Clothes and materials"},{"id":3,"title":"Illness and going online"},{"id":4,"title":"Revision"},{"id":5,"title":"Space and technology"},{"id":6,"title":"Home and safety"},{"id":7,"title":"Celebrations"},{"id":8,"title":"Revision"}],"lessons":{"1":[{"id":1,"title":"Family members","ar":"أفراد العائلة","icon":"👨‍👩‍👧‍👦","words":[["mother","👩"],["father","👨"],["grandfather","👴"],["grandmother","👵"],["brother","👦"],["sister","👧"],["cousin","🧒"],["uncle","👨 👦"]],"sentences":["How many cousins do you have?","I have two cousins."]},{"id":2,"title":"People at work","ar":"العاملون والمهن","icon":"👷","words":[["doctor","🧑‍⚕️"],["teacher","🧑‍🏫"],["farmer","🧑‍🌾"],["waiter","🧑‍🍳"],["builder","👷"],["engineer","🧑‍🔧"],["bus driver","🧑‍✈️"],["IT programmer","🧑‍💻"]],"sentences":["My mother is a teacher.","I want to be a doctor."]},{"id":3,"title":"Places of work","ar":"أماكن العمل","icon":"🏥","words":[["hospital","🏥"],["office","🏢"],["restaurant","🍽️"],["roads","🛣️"],["building site","🏗️"],["oil refinery","🏭"],["home","🏠"],["farm","🚜"]],"sentences":["A doctor works in a hospital.","A farmer works on a farm."]},{"id":4,"title":"My future job","ar":"مهنتي المستقبلية","icon":"💼","words":[["nurse","👩‍⚕️"],["cook","👩‍🍳"],["firefighter","🧑‍🚒"],["pilot","🧑‍✈️"],["baker","👨‍🍳"],["dentist","🦷"],["football player","⚽"],["shop assistant","🧑‍💼"]],"sentences":["When I grow up, I want to be a pilot."]}],"2":[{"id":1,"title":"Materials","ar":"المواد","icon":"🪵","words":[["glass","🥛"],["wood","🪵"],["leather","👜"],["metal","🔩"],["rubber","🛞"],["wool","🧶"],["cotton","☁️"],["denim","👖"]],"sentences":["What is the jug made of?","It is made of glass."]},{"id":2,"title":"Clothes we wear","ar":"الملابس التي نرتديها","icon":"👕","words":[["boots","🥾"],["sweater","🧥"],["T-shirt","👕"],["jeans","👖"],["shoes","👞"],["gloves","🧤"],["dress","👗"],["jacket","🧥 🧥"]],"sentences":["These jeans are too short.","This jacket is too expensive."]},{"id":3,"title":"Household objects","ar":"الأدوات المنزلية","icon":"🍴","words":[["jug","🫗"],["saucepan","🍲"],["pencil case","🖍️"],["smartphone","📱"],["knife","🔪"],["fork","🍴"],["spoon","🥄"],["bottle","🍶"]],"sentences":["The spoon is made of metal."]},{"id":4,"title":"Describing things","ar":"وصف الأشياء","icon":"🎨","words":[["soft","🧸"],["hard","🪨"],["colourful","🌈"],["plain","⬜"],["cheap","🪙"],["expensive","💎"],["thick","📚"],["thin","📄"]],"sentences":["This shirt is too expensive.","These shoes are too long."]}],"3":[{"id":1,"title":"Parts of the body","ar":"أجزاء الجسم","icon":"🧍","words":[["ear","👂"],["leg","🦵"],["arm","💪"],["mouth","👄"],["teeth","🦷"],["hand","✋"],["knee","🦵 🔹"],["shoulder","🤷"]],"sentences":["My arm hurts.","I hurt myself."]},{"id":2,"title":"Feeling unwell","ar":"الشعور بالمرض","icon":"🤒","words":[["headache","🤕"],["cough","😷"],["toothache","🦷"],["sore throat","🤒"],["fever","🌡️"],["stomach ache","🤢"],["cold","🤧"],["rash","🩹"]],"sentences":["I have a headache.","You should take some medicine."]},{"id":3,"title":"Using the internet","ar":"استخدام الإنترنت","icon":"🌐","words":[["computer","💻"],["smartphone","📱"],["tablet","📲"],["keyboard","⌨️"],["mouse","🖱️"],["website","🌐"],["webpage","📄"],["screen","🖥️"]],"sentences":["I use a computer to go online."]},{"id":4,"title":"Internet safety","ar":"السلامة على الإنترنت","icon":"🛡️","words":[["password","🔐"],["email","📧"],["login","🔑"],["search","🔎"],["click","🖱️"],["scroll down","⬇️"],["icon","🔷"],["address","🏠"]],"sentences":["You must keep your password safe.","You mustn’t meet a person you only know online."]}],"4":[{"id":1,"title":"Jobs review","ar":"مراجعة المهن","icon":"👩‍⚕️","words":[["doctor","🧑‍⚕️"],["engineer","🧑‍🔧"],["farmer","🧑‍🌾"],["teacher","🧑‍🏫"],["nurse","👩‍⚕️"],["waiter","🧑‍🍳"],["hospital","🏥"],["farm","🚜"]],"sentences":["Where does a doctor work?"]},{"id":2,"title":"Materials review","ar":"مراجعة المواد","icon":"🪵","words":[["wool","🧶"],["cotton","☁️"],["denim","👖"],["glass","🥛"],["metal","🔩"],["leather","👜"],["wood","🪵"],["rubber","🛞"]],"sentences":["What is the watch made of?"]},{"id":3,"title":"Health review","ar":"مراجعة الصحة","icon":"💊","words":[["headache","🤕"],["cough","😷"],["fever","🌡️"],["sore throat","🤒"],["toothache","🦷"],["rash","🩹"],["knee","🦵"],["shoulder","🤷"]],"sentences":["I have a headache."]},{"id":4,"title":"Internet review","ar":"مراجعة الإنترنت","icon":"🌐","words":[["computer","💻"],["keyboard","⌨️"],["website","🌐"],["password","🔐"],["search","🔎"],["mouse","🖱️"],["icon","🔷"],["email","📧"]],"sentences":["You must keep your password safe."]}],"5":[{"id":1,"title":"The solar system","ar":"المجموعة الشمسية","icon":"🪐","words":[["Sun","☀️"],["Moon","🌙"],["Mercury","🪐"],["Venus","🟡"],["Earth","🌎"],["Mars","🔴"],["Jupiter","🪐 ♃"],["Saturn","🪐 🪐"]],"sentences":["Jupiter is the biggest planet."]},{"id":2,"title":"More planets","ar":"كواكب أخرى","icon":"🌌","words":[["Uranus","🪐"],["Neptune","🔵"],["planet","🪐 🌌"],["solar system","🌌"],["ring","💍"],["storm","⛈️"],["gas","💨"],["dust","🌫️"]],"sentences":["The planets move around the Sun."]},{"id":3,"title":"Space travel","ar":"السفر إلى الفضاء","icon":"👩‍🚀","words":[["astronaut","🧑‍🚀"],["spaceship","🚀"],["space travel","🌠"],["rocket","🚀 🔹"],["star","⭐"],["future","🔮"],["century","📆"],["invention","💡"]],"sentences":["Space travel will be faster in the future."]},{"id":4,"title":"Tomorrow’s technology","ar":"تكنولوجيا المستقبل","icon":"🤖","words":[["robot","🤖"],["driverless car","🚘"],["computer","💻"],["technology","💻 🔹"],["building","🏢"],["safer","🛡️"],["intelligent","🧠"],["faster","⚡"]],"sentences":["There will be driverless cars.","Robots will help people."]}],"6":[{"id":1,"title":"In the kitchen","ar":"في المطبخ","icon":"🥣","words":[["bread","🍞"],["tomato","🍅"],["onion","🧅"],["cheese","🧀"],["garlic","🧄"],["pepper","🫑"],["oil","🫒"],["herbs","🌿"]],"sentences":["Can we make a pizza?","We need bread and tomatoes."]},{"id":2,"title":"Cooking actions","ar":"أفعال الطبخ","icon":"👩‍🍳","words":[["add","➕"],["bake","🥖"],["grate","🧀"],["mix","🥣"],["peel","🍊"],["slice","🔪"],["spread","🍞"],["wash","🧽"]],"sentences":["My mum baked a cake.","I am going to slice the onions."]},{"id":3,"title":"Kitchen tools","ar":"أدوات المطبخ","icon":"🍴","words":[["knife","🔪"],["fork","🍴"],["spoon","🥄"],["grater","🧀"],["oven","♨️"],["saucepan","🍲"],["plate","🍽️"],["bowl","🥣"]],"sentences":["You must be careful with knives."]},{"id":4,"title":"Stay safe","ar":"حافظ على سلامتك","icon":"🚲","words":[["zebra crossing","🚸"],["seat belt","🚗"],["road signal","🚦"],["brakes","🛑"],["helmet","🪖"],["handlebars","🚲"],["matches","🔥"],["cleaning materials","🧴"]],"sentences":["Wear a helmet when riding a bike.","Don’t play with matches."]}],"7":[{"id":1,"title":"Special occasions","ar":"المناسبات الخاصة","icon":"🎂","words":[["Mother’s Day","💐"],["Teacher’s Day","🍎"],["birthday","🎂"],["New Year","🎆"],["party","🥳"],["congratulations","🎉"],["cake","🎂 🔹"],["cards","💌"]],"sentences":["Today is Mum’s birthday."]},{"id":2,"title":"Party preparations","ar":"التحضير للحفلة","icon":"🎈","words":[["decorations","🎊"],["balloons","🎈"],["wrapping paper","🎁"],["presents","🎁 📦"],["pictures","🖼️"],["to-do list","📋"],["flowers","🌷"],["shopping list","🛒"]],"sentences":["We are putting up decorations."]},{"id":3,"title":"Gifts","ar":"الهدايا","icon":"🎁","words":[["leather bag","👜"],["wooden frame","🖼️"],["metal watch","⌚"],["woollen scarf","🧣"],["present","🎁"],["card","💌"],["box","📦"],["ribbon","🎀"]],"sentences":["I am wrapping a present."]},{"id":4,"title":"At the party","ar":"في الحفلة","icon":"🥳","words":[["cook","👩‍🍳"],["bake","🥖"],["clean","🧹"],["wrap","🎁"],["decorate","🎊"],["make a card","✂️"],["blow balloons","🎈"],["invite","💌"]],"sentences":["She is baking a cake.","They are blowing up balloons."]}],"8":[{"id":1,"title":"Work and family","ar":"المهن والعائلة","icon":"👪","words":[["mother","👩"],["cousin","🧒"],["doctor","🧑‍⚕️"],["builder","👷"],["farmer","🧑‍🌾"],["hospital","🏥"],["engineer","🧑‍🔧"],["office","🏢"]],"sentences":["My brother is an engineer."]},{"id":2,"title":"Materials and health","ar":"المواد والصحة","icon":"🩺","words":[["cotton","☁️"],["denim","👖"],["wool","🧶"],["metal","🔩"],["headache","🤕"],["fever","🌡️"],["cough","😷"],["sore throat","🤒"]],"sentences":["I have a headache."]},{"id":3,"title":"Space and safety","ar":"الفضاء والسلامة","icon":"🪐","words":[["Mars","🔴"],["Jupiter","🪐"],["astronaut","🧑‍🚀"],["robot","🤖"],["helmet","🪖"],["matches","🔥"],["seat belt","🚗"],["zebra crossing","🚸"]],"sentences":["We must be careful on the road."]},{"id":4,"title":"Celebrations review","ar":"مراجعة الاحتفالات","icon":"🎈","words":[["birthday","🎂"],["Mother’s Day","💐"],["cake","🎂 🔹"],["balloons","🎈"],["presents","🎁"],["decorations","🎊"],["woollen scarf","🧣"],["wrapping paper","🎁 🎀"]],"sentences":["They are making a card."]}]}};
function gradeSeedHasAllLessons(seed) {
 if (!seed || !Array.isArray(seed.units) || seed.units.length !== 8 || !seed.lessons) return false;
 return Array.from({length:8},(_,i)=>seed.lessons[String(i+1)]).every(v=>Array.isArray(v)&&v.length>=4);
}
const EAI_GRADE5_SOURCE=gradeSeedHasAllLessons(window.EAI_GRADE5_SEED_DATA)?window.EAI_GRADE5_SEED_DATA:UPPER_GRADE_5_FALLBACK;
const EAI_GRADE6_SOURCE=gradeSeedHasAllLessons(window.EAI_GRADE6_SEED_DATA)?window.EAI_GRADE6_SEED_DATA:UPPER_GRADE_6_FALLBACK;
const BOOK5=EAI_GRADE5_SOURCE.units,SEED5=EAI_GRADE5_SOURCE.lessons;
const BOOK6=EAI_GRADE6_SOURCE.units,SEED6=EAI_GRADE6_SOURCE.lessons;
const gradeOf=d=>Number(d?.grade||1);
let firebase=null,auth=null,db=null,docs=[],selected=null,cloudEnabled=false,user=null;
const status=(msg,kind='ok')=>{$('status').innerHTML=`<div class="${kind}">${esc(msg)}</div>`;};
function syncUnitMenus(){
 const grade=Number($('gradeId').value||1),books=grade===2?BOOK2:grade===3?BOOK3:grade===4?BOOK4:grade===5?BOOK5:grade===6?BOOK6:BOOK,chosen=$('unitId').value;
 $('unitId').innerHTML=books.map(u=>`<option value="${u.id}">Unit ${u.id} – ${esc(u.title)}</option>`).join('');
 if(books.some(u=>String(u.id)===chosen))$('unitId').value=chosen;
 const filterGrade=$('gradeFilter').value,filterBook=filterGrade==='6'?BOOK6:filterGrade==='5'?BOOK5:filterGrade==='4'?BOOK4:filterGrade==='3'?BOOK3:filterGrade==='2'?BOOK2:filterGrade==='1'?BOOK:null,current=$('filter').value;
 const opts=filterBook?filterBook.map(u=>`<option value="${u.id}">Unit ${u.id} – ${esc(u.title)}</option>`).join(''):'';
 $('filter').innerHTML='<option value="all">جميع الوحدات</option>'+opts;
 if(filterBook&&filterBook.some(u=>String(u.id)===current))$('filter').value=current;
}
syncUnitMenus();
const key=(grade,u,id)=>grade===1?`${u}_${id}`:`g${grade}_${u}_${id}`;
// Firestore does not permit an array nested directly inside another array.
// Store words as objects, while keeping the local editor/game format [text,picture].
function wordsToFirestore(words) {
  return (Array.isArray(words)?words:[]).map(w => {
    const text = Array.isArray(w)?w[0]:w?.text;
    const picture = Array.isArray(w)?w[1]:w?.picture;
    return {text:String(text??'').trim(),picture:String(picture??'📘')};
  }).filter(w => w.text);
}
function wordsFromFirestore(words) {
  return (Array.isArray(words)?words:[]).map(w =>
    Array.isArray(w)?[String(w[0]??''),String(w[1]??'📘')]:
    (w && typeof w==='object')?[String(w.text??''),String(w.picture??'📘')]:[]
  ).filter(w => w.length===2 && w[0].trim());
}

function formRead(){const unitId=Number($('unitId').value),lessonId=Number($('lessonId').value);const words=$('words').value.split(/\r?\n/).filter(x=>x.trim()).map(line=>{const i=line.indexOf('|');return i<0?[line.trim(),'📘']:[line.slice(0,i).trim(),line.slice(i+1).trim()||'📘']});const sentences=$('sentences').value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
return {...(Number($('gradeId').value)>1?{grade:Number($('gradeId').value)}:{}),unitId,lessonId,title:$('title').value.trim(),ar:$('ar').value.trim(),icon:$('icon').value.trim()||'📚',words,sentences,published:$('publishedInput').checked}}
function fillForm(d){
 selected=d?.id||null;
 $('formTitle').textContent=d?'✏️ تعديل درس':'➕ إضافة درس';
 $('gradeId').value=String(gradeOf(d));syncUnitMenus();
 $('unitId').value=d?.unitId||1;
 $('lessonId').value=d?.lessonId||nextLesson(Number($('unitId').value),gradeOf(d));
 $('title').value=d?.title||'';$('ar').value=d?.ar||'';$('icon').value=d?.icon||'📚';
 $('words').value=(d?.words||[]).map(w=>w.join(' | ')).join('\n');
 $('sentences').value=(d?.sentences||[]).join('\n');
 $('publishedInput').checked=d?.published!==false;
 $('delete').disabled=!d;renderList();
}
function nextLesson(u,grade=Number($('gradeId').value||1)){
 return 1+Math.max(0,...docs.filter(d=>d.unitId===u&&gradeOf(d)===grade).map(d=>d.lessonId));
}
function renderList(){
 const gradeFilter=$('gradeFilter').value,filter=$('filter').value,q=$('search').value.toLowerCase().trim();
 const list=docs.filter(d=>(gradeFilter==='all'||String(gradeOf(d))===gradeFilter)&&
 (filter==='all'||String(d.unitId)===filter)&&(`${d.title} ${d.ar}`.toLowerCase().includes(q)))
 .sort((a,b)=>gradeOf(a)-gradeOf(b)||a.unitId-b.unitId||a.lessonId-b.lessonId);
 $('items').innerHTML=list.length?list.map(d=>`<button type="button" class="item ${d.id===selected?'active':''}" data-id="${esc(d.id)}"><span class="num">${gradeOf(d)} · ${d.unitId}.${d.lessonId}</span><span style="flex:1"><strong>${esc(d.icon)} ${esc(d.title)}</strong><br><small class="muted">${esc(d.ar)}</small></span><span class="pill" style="background:${d.published?'#deffef':'#ffe5eb'}">${d.published?'منشور':'مخفي'}</span></button>`).join(''):'<p class="hint">لا توجد دروس ضمن هذا الاختيار.</p>';
 $('total').textContent=docs.length;$('published').textContent=docs.filter(x=>x.published).length;$('drafts').textContent=docs.filter(x=>!x.published).length;
 $('cloudStatus').textContent=cloudEnabled?'الموقع يسحب الدروس من Firestore':'الموقع يستخدم الدروس المحلية حالياً';
}
async function refresh(){
 const {collection,getDocs,doc,getDoc}=firebase.fs;
 const snapshot=await getDocs(collection(db,'lessons'));
 docs=snapshot.docs.map(d=>({id:d.id,...d.data(),words:wordsFromFirestore(d.data().words)}));
 const meta=await getDoc(doc(db,'site_meta','public'));
 cloudEnabled=meta.data()?.cloudEnabled===true;renderList();
}
function download(filename,body,mime='application/json'){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([body],{type:mime}));a.href=url;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(url),5000)}
async function login(e){e.preventDefault();$('loginMsg').textContent='جاري التحقق من الحساب...';$('loginButton').disabled=true;try{const {signInWithEmailAndPassword,signOut}=firebase.au;const result=await signInWithEmailAndPassword(auth,$('email').value,$('password').value);const {doc,getDoc}=firebase.fs;
// Important: only the real manager can read this private marker by Firestore rules,
// even if it doesn't exist as a document yet.
try{await getDoc(doc(db,'site_meta','private-admin-check'))}catch(err){await signOut(auth);throw new Error('لا توجد صلاحية مدير لهذا الحساب. تأكد من UID في قواعد Firestore المنشورة.')}
user=result.user;$('login').classList.add('hidden');$('dashboard').classList.remove('hidden');$('signout').classList.remove('hidden');await refresh();fillForm(null);status('تم تسجيل الدخول بصلاحيات المدير.','ok');
}catch(err){$('loginMsg').innerHTML=`<div class="error">${esc(err.message||err.code||'فشل تسجيل الدخول')}</div>`}finally{$('loginButton').disabled=false}}
function handleError(e){status('تعذّر تنفيذ العملية: '+[e?.code,e?.message].filter(Boolean).join(' — '),'error')}
async function save(e){e.preventDefault();const data=formRead(),oldId=selected,newId=key(gradeOf(data),data.unitId,data.lessonId);if(!data.title||data.words.length<2){status('أدخل عنواناً وكلمتين على الأقل لكل درس.','error');return}if(data.unitId<1||data.unitId>8||!Number.isInteger(data.lessonId)||data.lessonId<1||data.lessonId>100){status('رقم الوحدة أو الدرس غير صحيح.','error');return}if(newId!==oldId&&docs.some(d=>d.id===newId)){status('يوجد درس بنفس رقم الوحدة ورقم الدرس.','error');return}
$('save').disabled=true;try{const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);batch.set(doc(db,'lessons',newId),{...data,words:wordsToFirestore(data.words),updatedAt:serverTimestamp()});if(oldId&&oldId!==newId)batch.delete(doc(db,'lessons',oldId));await batch.commit();await refresh();fillForm(docs.find(d=>d.id===newId));status('حُفظ الدرس بنجاح في Firestore.','ok')}catch(e){handleError(e)}finally{$('save').disabled=false}}
async function remove(){if(!selected||!confirm('هل تريد حذف هذا الدرس نهائياً من قاعدة البيانات؟'))return;try{const {deleteDoc,doc}=firebase.fs;await deleteDoc(doc(db,'lessons',selected));await refresh();fillForm(null);status('تم حذف الدرس.','ok')}catch(e){handleError(e)}}
async function seed(){if(!confirm('استيراد الدروس التجريبية إلى Firestore؟ لن يتم استبدال أي درس موجود بالفعل.'))return;try{const {writeBatch,doc,serverTimestamp}=firebase.fs;const batch=writeBatch(db);let count=0;const exists=new Set(docs.map(d=>d.id));for(const [u,list] of Object.entries(SEED)) for(const l of list){const id=key(1,Number(u),l.id);if(exists.has(id))continue;batch.set(doc(db,'lessons',id),{unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++}
if(count)await batch.commit();await refresh();status(`اكتمل استيراد ${count} درس جديد. الدروس الموجودة لم تتغير. اضغط تفعيل النشر السحابي عندما تراجعها.`)}catch(e){handleError(e)}}
async function seed2(){
 if(!confirm('إضافة 32 درساً تدريبياً للصف الثاني حسب خريطة الكتاب؟ لن نغيّر أي درس موجود.'))return;
 try{
  const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);
  const exists=new Set(docs.map(d=>d.id));let count=0;
  for(const [u,list] of Object.entries(SEED2))for(const l of list){
    const id=key(2,Number(u),l.id);if(exists.has(id))continue;
    batch.set(doc(db,'lessons',id),{grade:2,unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++;
  }
  if(count)await batch.commit();await refresh();
  status(`تم استيراد ${count} درس للصف الثاني. راجع الوحدات قبل مشاركة الموقع.`);
 }catch(e){handleError(e)}
}
async function seed3(){
 if(!confirm('إضافة 32 درساً تدريبياً للصف الثالث بحسب خريطة الكتاب؟ لن نستبدل أي درس موجود.'))return;
 try{
  const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);
  const exists=new Set(docs.map(d=>d.id));let count=0;
  for(const [u,list] of Object.entries(SEED3))for(const l of list){
    const id=key(3,Number(u),l.id);if(exists.has(id))continue;
    batch.set(doc(db,'lessons',id),{grade:3,unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++;
  }
  if(count)await batch.commit();await refresh();
  status(`تم استيراد ${count} درس للصف الثالث. راجع الوحدات والمحتوى قبل نشرها.`);
 }catch(e){handleError(e)}
}
async function seed4(){
 if(!confirm('إضافة 32 درساً تدريبياً للصف الرابع اعتماداً على خريطة الكتاب؟ الدروس الموجودة لن تتغير.'))return;
 try{
   const {writeBatch,doc,serverTimestamp}=firebase.fs,batch=writeBatch(db);
   const exists=new Set(docs.map(d=>d.id));let count=0;
   for(const [u,list] of Object.entries(SEED4))for(const l of list){
      const id=key(4,Number(u),l.id);if(exists.has(id))continue;
      batch.set(doc(db,'lessons',id),{grade:4,unitId:Number(u),lessonId:l.id,title:l.title,ar:l.ar,icon:l.icon,words:wordsToFirestore(l.words),sentences:l.sentences,published:true,updatedAt:serverTimestamp()});count++;
   }
   if(count)await batch.commit();await refresh();
   status(`تم استيراد ${count} درساً للصف الرابع دون استبدال الدروس الموجودة. راجعها قبل النشر.`);
 }catch(e){handleError(e)}
}
function safeLessonIcon(value) {
 const icon=String(value||'📚');
 const compact={'👨‍👩‍👧‍👦':'👪','👩‍⚕️':'🩺','👩‍🚀':'🚀','👩‍🍳':'🍳'};
 const cleaned=compact[icon]||icon;
 return new TextEncoder().encode(cleaned).length<=12?cleaned:'📚';
}
async function seedUpper(grade, lessonMap) {
 const gradeName=grade===5?'الخامس':'السادس';
 const grouped=Object.entries(lessonMap||{});
 const lessons=grouped.flatMap(([u,list])=>Array.isArray(list)?list.map(l=>({u:Number(u),...l})):[]);
 if(grouped.length!==8 || lessons.length!==32 || lessons.some(l=>!(l.u>=1 && l.u<=8) || !Number.isInteger(Number(l.id)) || !Array.isArray(l.words) || l.words.length<2)) {
  status(`تعذّر تجهيز بيانات الصف ${gradeName}: يجب أن يحتوي على 8 وحدات و32 درساً. لم يتم تغيير أي بيانات.`, 'error');
  return;
 }
 if(!confirm(`استيراد ${lessons.length} درساً للصف ${gradeName}؟ سيتم تجاوز الدروس الموجودة دون تغييرها.`))return;
 const button=$('seed'+grade);
 if(button)button.disabled=true;
 try {
  const {writeBatch,doc,serverTimestamp}=firebase.fs;
  const exists=new Set(docs.map(d=>d.id));
  const missing=lessons.filter(l=>!exists.has(key(grade,l.u,Number(l.id))));
  if(!missing.length) {
   status(`دروس الصف ${gradeName} الـ32 موجودة بالفعل في قاعدة البيانات؛ لم يتم استبدال أي درس.`);
   return;
  }
  // Use a single atomic batch: no half-import if a Firestore rule rejects one lesson.
  const batch=writeBatch(db);
  for(const l of missing){
   const data={grade,unitId:l.u,lessonId:Number(l.id),title:String(l.title||'Lesson').slice(0,120),
    ar:String(l.ar||'').slice(0,140),icon:safeLessonIcon(l.icon),
    words:wordsToFirestore(l.words),sentences:(l.sentences||[]).map(s=>String(s)),
    published:true,updatedAt:serverTimestamp()};
   batch.set(doc(db,'lessons',key(grade,l.u,Number(l.id))),data);
  }
  await batch.commit();
  await refresh();
  status(`نجح استيراد ${missing.length} درساً للصف ${gradeName}. الدروس الموجودة سابقاً لم تتغير.`);
 } catch(e) {
  const errorCode=String(e?.code||'');
  if(errorCode.includes('permission-denied')) {
   status(`رفض Firebase حفظ دروس الصف ${gradeName}. افتح Cloud Firestore ← Rules وتأكد أن شرط الصف grade يسمح بالقيم من 1 إلى 6 (<= 6)، ثم اضغط Publish. لم يُحفظ أي درس من هذه الدفعة.`,'error');
  } else if(errorCode.includes('unauthenticated')) {
   status('انتهت جلسة المدير. سجّل الخروج ثم الدخول وأعد الاستيراد.','error');
  } else {
   handleError(e);
  }
 } finally {if(button)button.disabled=false;}
}
async function activate(){if(!docs.some(d=>d.published)){status('استورد أو أضف درساً منشوراً قبل تفعيل النشر السحابي.','error');return}if(!confirm('بعد التفعيل سيعتمد موقع الطلاب على دروس Firestore المنشورة بدلاً من الدروس المحلية. هل تؤكد؟'))return;try{const {setDoc,doc,serverTimestamp}=firebase.fs;await setDoc(doc(db,'site_meta','public'),{cloudEnabled:true,updatedAt:serverTimestamp()});cloudEnabled=true;renderList();status('تم تفعيل المحتوى السحابي. راجع رابط الموقع المنشور بعد رفع الملفات الجديدة.')}catch(e){handleError(e)}}
async function boot(){if(!configured){$('setup').classList.remove('hidden');return}try{const base='https://www.gstatic.com/firebasejs/11.10.0/';const [{initializeApp},{getAuth,signInWithEmailAndPassword,signOut},{getFirestore,doc,getDoc,getDocs,collection,writeBatch,serverTimestamp,deleteDoc,setDoc}]=await Promise.all([import(base+'firebase-app.js'),import(base+'firebase-auth.js'),import(base+'firebase-firestore.js')]);const app=initializeApp(cfg);auth=getAuth(app);db=getFirestore(app);firebase={au:{signInWithEmailAndPassword,signOut},fs:{getFirestore,doc,getDoc,getDocs,collection,writeBatch,serverTimestamp,deleteDoc,setDoc}};$('login').classList.remove('hidden');}catch(e){$('setup').classList.remove('hidden');$('setup').insertAdjacentHTML('beforeend','<div class="error">تعذّر تحميل Firebase. تأكد من الإنترنت وإعدادات التطبيق.</div>')}}
$('loginForm').addEventListener('submit',login);$('lessonForm').addEventListener('submit',save);$('delete').addEventListener('click',remove);$('seed').addEventListener('click',seed);$('seed2').addEventListener('click',seed2);$('seed3').addEventListener('click',seed3);$('seed4').addEventListener('click',seed4);$('seed5').addEventListener('click',()=>seedUpper(5,SEED5));$('seed6').addEventListener('click',()=>seedUpper(6,SEED6));$('activate').addEventListener('click',activate);$('reset').addEventListener('click',()=>fillForm(null));$('new').addEventListener('click',()=>fillForm(null));$('filter').addEventListener('change',renderList);$('gradeFilter').addEventListener('change',()=>{syncUnitMenus();renderList()});$('gradeId').addEventListener('change',()=>{syncUnitMenus();if(!selected)$('lessonId').value=nextLesson(Number($('unitId').value),Number($('gradeId').value))});$('search').addEventListener('input',renderList);$('unitId').addEventListener('change',()=>{if(!selected)$('lessonId').value=nextLesson(Number($('unitId').value),Number($('gradeId').value))});$('items').addEventListener('click',e=>{const item=e.target.closest('[data-id]');if(item){const d=docs.find(x=>x.id===item.dataset.id);if(d)fillForm(d)}});$('signout').addEventListener('click',async()=>{await firebase.au.signOut(auth);user=null;location.reload()});$('backup').addEventListener('click',()=>download('english-adventure-lessons-backup.json',JSON.stringify(docs,null,2)));boot();
