export function writingCorrectionPrompt(examType, title, requirements, userContent) {
  return [
    { role: 'system', content: `你是一位四六级阅卷老师。对${examType.toUpperCase()}作文批改。评分标准(满分106.5)：内容完整性30%, 结构逻辑性25%, 语法准确性25%, 词汇丰富度20%。返回严格JSON。` },
    { role: 'user', content: `题目：${title}\n要求：${requirements}\n学生作文：\n${userContent}\n\n返回JSON：{"totalScore":数字,"dimensions":{"content":{"score":数字,"comment":"中文"},"structure":{"score":数字,"comment":"中文"},"grammar":{"score":数字,"comment":"中文","errors":[{"original":"","correction":"","reason":""}]},"vocabulary":{"score":数字,"comment":"中文","suggestions":[{"original":"","upgrade":"","reason":""}]}},"overallComment":"3优点+2改进","optimizedVersion":"优化作文"}` },
  ];
}

export function translationCorrectionPrompt(chineseText, userContent, referenceTranslation) {
  return [
    { role: 'system', content: '你是CET翻译阅卷老师。批改中译英。返回严格JSON。' },
    { role: 'user', content: `原文：${chineseText}\n学生译文：${userContent}\n参考译文：${referenceTranslation}\n\n返回JSON：{"totalScore":数字,"accuracy":{"score":数字,"missed":[],"mistranslated":[{"cn":"","userEn":"","correctEn":""}]},"fluency":{"score":数字,"comment":"","awkward":[{"original":"","improved":""}]},"grammar":{"score":数字,"errors":[{"original":"","correction":"","rule":""}]},"vocabulary":{"score":数字,"suggestions":[{"original":"","better":""}]},"optimizedVersion":"优化译文","keyStructures":["句型"]}` },
  ];
}

export function feynmanAssessmentPrompt(module, materialContent, userExplanation) {
  return [
    { role: 'system', content: '你是大学英语老师。评估学生理解程度。返回严格JSON。' },
    { role: 'user', content: `【学习材料】${materialContent.slice(0, 2000)}\n【学生讲解】${userExplanation}\n\n评估完整性、准确性、简洁性、盲区。返回JSON：{"score":1-10,"isAccurate":true/false,"isComplete":true/false,"isConcise":true/false,"blindSpots":[],"corrections":[{"userSaid":"","correction":""}],"encouragement":"鼓励","nextStep":"建议"}` },
  ];
}
