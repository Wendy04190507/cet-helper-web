export const SEED_EXERCISES = [
  // Writing (2)
  { module: 'writing', examType: 'cet4', difficulty: 'medium', title: '议论文：在线学习的利弊',
    content: { prompt: 'For this part, you are allowed 30 minutes to write a short essay on the impact of online learning. You should write at least 120 words.', requirements: '请围绕在线学习对传统教育的影响展开论述，包括优势和潜在问题。', keyPoints: ['在线教育的普及', '传统课堂 vs 在线学习', '个人观点和理由'], sampleStructure: '开头引入→利弊分析→结论' }
  },
  { module: 'writing', examType: 'cet6', difficulty: 'hard', title: '议论文：人工智能与就业',
    content: { prompt: 'For this part, you are allowed 30 minutes to write a short essay on the impact of AI on employment. You should write at least 150 words.', requirements: '请论述人工智能对就业市场的影响，讨论机遇与挑战并提出应对建议。', keyPoints: ['AI替代的岗位', 'AI创造的新机会', '个人和社会层面的应对'], sampleStructure: '引出话题→挑战→机遇→结论' }
  },
  // Translation (2)
  { module: 'translation', examType: 'cet4', difficulty: 'medium', title: '中国茶文化',
    content: { chineseText: '中国是茶的故乡，茶文化源远流长。中国人饮茶已有四千多年的历史，茶不仅是饮品，更是一种文化的象征。中国茶种类繁多，如绿茶、红茶、乌龙茶等，各具特色。', keyExpressions: [{cn:'故乡',en:'hometown'},{cn:'源远流长',en:'has a long history'},{cn:'象征',en:'symbol'},{cn:'各具特色',en:'each with its own characteristics'}], referenceTranslation: 'China is the hometown of tea, and its tea culture has a long history. Chinese people have been drinking tea for over four thousand years. Tea is not only a beverage but also a symbol of culture. Chinese tea comes in many varieties, such as green tea, black tea, and oolong tea, each with its own characteristics.' }
  },
  { module: 'translation', examType: 'cet6', difficulty: 'hard', title: '中国数字经济',
    content: { chineseText: '近年来，中国数字经济蓬勃发展，已成为推动经济增长的重要引擎。移动支付、电子商务和人工智能技术广泛应用于各行各业，极大地方便了人们的生活。', keyExpressions: [{cn:'数字经济',en:'digital economy'},{cn:'蓬勃发展',en:'flourish'},{cn:'重要引擎',en:'major engine'}], referenceTranslation: 'In recent years, China\'s digital economy has flourished and become a major engine driving economic growth. Mobile payment, e-commerce, and AI technologies are widely applied across various industries, greatly facilitating people\'s lives.' }
  },
  // Listening (2)
  { module: 'listening', examType: 'cet4', difficulty: 'easy', title: '校园对话：选课咨询',
    content: { passage: 'A student is talking with her academic advisor about course selection.', transcript: 'Student: Professor Smith, I need your advice on which courses to take next semester.\nProfessor: Of course. What are you considering?\nStudent: I\'m interested in International Relations, but I\'m worried it might be too difficult.\nProfessor: It is challenging, but you have the prerequisites. I think you can handle it.\nStudent: Thank you. I\'ll give it a try.', questions: [{question:'What is the student concerned about?', options:['The course is expensive','The course might be difficult','The professor is unavailable','The classroom is far'], answer:'The course might be difficult'},{question:'What does the professor think?', options:['Drop the course','The student can handle it','The course is full','The course is cancelled'], answer:'The student can handle it'}] }
  },
  { module: 'listening', examType: 'cet6', difficulty: 'medium', title: '讲座：气候变化的影响',
    content: { passage: 'A lecture discussing climate change impacts on global agriculture.', transcript: 'Good morning everyone. Today we\'ll examine how climate change is affecting global food production. Over the past decade, rising temperatures have reduced crop yields by an average of 5% worldwide. Developing countries are particularly vulnerable due to limited resources for adaptation. However, new drought-resistant crop varieties offer some hope.', questions: [{question:'What is the main topic?', options:['Urban development','Climate change and agriculture','International trade','Renewable energy'], answer:'Climate change and agriculture'},{question:'By what percentage have crop yields decreased?', options:['3%','5%','10%','15%'], answer:'5%'}] }
  },
  // Reading (2)
  { module: 'reading', examType: 'cet4', difficulty: 'medium', title: '远程工作的趋势',
    content: { passage: 'The COVID-19 pandemic has fundamentally changed how we work. Remote work, once considered a perk offered by a few tech companies, has become mainstream. Studies show that many employees are more productive when working from home, citing fewer interruptions and flexible schedules. However, challenges remain, including feelings of isolation and the blurring of work-life boundaries. Companies are now adopting hybrid models that combine the benefits of both office and remote work.', questions: [{question:'What has become mainstream?', options:['Office work','Remote work','Part-time work','Shift work'], answer:'Remote work'},{question:'What is a challenge of remote work mentioned?', options:['Higher salary','Feelings of isolation','Longer commute','Office politics'], answer:'Feelings of isolation'},{question:'What model are companies adopting?', options:['Full office','Full remote','Hybrid models','Freelance'], answer:'Hybrid models'}] }
  },
  { module: 'reading', examType: 'cet6', difficulty: 'hard', title: '人工智能伦理',
    content: { passage: 'As artificial intelligence systems become more sophisticated, ethical considerations have moved to the forefront of technological discourse. The deployment of AI in decision-making processes raises fundamental questions about accountability, fairness, and transparency. Critics argue that without proper oversight, AI systems may perpetuate existing biases, while proponents emphasize the potential for AI to make more objective decisions than humans.', questions: [{question:'What is the main concern about AI in decision-making?', options:['Cost','Accountability and fairness','Speed','Storage'], answer:'Accountability and fairness'},{question:'What do critics worry about?', options:['Too expensive','Perpetuating biases','Too slow','Too much power'], answer:'Perpetuating biases'}] }
  },
];
