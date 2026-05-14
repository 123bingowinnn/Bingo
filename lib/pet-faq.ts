/**
 * Pet chat FAQ — keyword-based routing.
 *
 * The pet should know the whole site. Replies are structured (a one-line
 * headline + a short bullet list) and end on a pet-toned beat so it stays
 * a pet, not a help-desk bot. Order matters: more specific patterns must
 * appear before generic catch-alls.
 */

type Route = { match: RegExp; reply: string };

export const FAQ_ROUTES_EN: Route[] = [
  // ── Identity / who-are-you ────────────────────────────────────────────
  { match: /who('?s| is) bingo|who('?s| is) xubin|tell me about (him|bingo|xubin)|introduce|about (him|you|bingo|xubin)/i,
    reply: "About Bingo ✦\n• Xubin (Bingo) Sun — heading to Yale for an M.S. in CS, Fall 2026\n• Currently AI Product Manager Intern at Zoom\n• 3 SCI papers · 4 internships · 6 grad-school offers\n*tail wag* — product + engineering + research, one human." },

  // ── Pet's own identity ────────────────────────────────────────────────
  { match: /who are you|your name|what are you|pet|you('?re| are) cute/i,
    reply: "About me ✦\n• I'm Bingo's pixel pet — site mascot and tour guide\n• Click me anytime, I'll fetch the answer\n• Stroke me a few times and I get a little overexcited\n*spins in place*" },

  // ── Yale + all admissions ─────────────────────────────────────────────
  { match: /yale|grad school|master('?s)?|cs ms|going|when.*(school|fall|grad)/i,
    reply: "Grad school ✦\n• Yale University — M.S. Computer Science, Fall 2026\n• Also admitted: CMU, Columbia, Cornell, Northwestern, UCL\n• Picked Yale for the research + community fit\n*ears perked* it's a big year." },

  { match: /cmu|columbia|cornell|northwestern|ucl|other (offer|admit)|where else/i,
    reply: "Other admits ✦\n• CMU · Columbia · Cornell · Northwestern · UCL\n• All for CS / data-related M.S. programs\n• Chose Yale in the end\n*proud little woof*" },

  // ── WKU undergrad ─────────────────────────────────────────────────────
  { match: /wku|wenzhou|kean|undergrad|bachelor|学校|温州/i,
    reply: "Undergrad ✦\n• Wenzhou-Kean University — BSc Computer Science, 2022–2026\n• US-curriculum joint campus in Wenzhou, China\n• Worked as TA + library IT assistant on the side\n*tail wag* foundation years." },

  // ── Zoom (current) ────────────────────────────────────────────────────
  { match: /zoom|current.*intern|right now|now.*work/i,
    reply: "Zoom — current ✦\n• AI Product Manager Intern, Dec 2025 → present\n• Owning PRDs from zero to launch on AI features\n• Built an LLM-Judge eval framework for Zoom Present\n*chest puff* his daily mission." },

  // ── Alibaba Cloud ─────────────────────────────────────────────────────
  { match: /alibaba|aliyun|dataphin|lingyang|storylane/i,
    reply: "Alibaba Cloud — Dataphin / Lingyang ✦\n• 3 months, product + GTM\n• Shipped 50+ interactive product demos\n• Built a channel-funnel dashboard\n• Liaison with Storylane's California team\n*nose boop* cloud-team chapter." },

  // ── Deloitte ──────────────────────────────────────────────────────────
  { match: /deloitte|sap|spring boot|mybatis|xxl[ -]?job/i,
    reply: "Deloitte — SAP project ✦\n• 3 months, Java backend\n• Spring Boot + MyBatis + XXL-JOB\n• Owned supplier-quality & payroll modules\n• Wrote DingTalk automation pushes\n*sit pretty* enterprise rigor." },

  // ── Penghui ───────────────────────────────────────────────────────────
  { match: /penghui|朋辉|first intern|big[- ]?data|zhipu/i,
    reply: "Penghui Big Data — first internship ✦\n• Summer 2024, his first real-world build\n• Wired Zhipu LLM into a standardized service path\n• Wrote Spark / Hive jobs for the data layer\n• Where coding tasks turned into product instincts\n*tail wag* origin story." },

  // ── Papers / research overview ────────────────────────────────────────
  { match: /paper|publication|sci|q1|research overall|all paper/i,
    reply: "Papers (3) ✦\n• SCI Q1 — LLM negative rejection survey (2025)\n• ICCGIV 2024 — PathMNIST robustness\n• AASIP 2024 — OCTMNIST privacy-preserving distillation\n*sit pretty* peer-reviewed work." },

  // ── Individual papers ─────────────────────────────────────────────────
  { match: /reject(ion)?|negative reject|hallucinat|refus/i,
    reply: "LLM negative-rejection survey ✦\n• Published SCI Q1, 2025\n• Maps how/when LLMs refuse vs answer\n• Covers benchmarks, taxonomy, mitigations\n*ears up* his biggest research piece." },

  { match: /pathmnist|robust(ness)?|medmnist|pathology/i,
    reply: "PathMNIST robustness ✦\n• ICCGIV 2024\n• Tests vision models against pathology-image perturbations\n• Co-authored, his first conference paper\n*tail wag* medical imaging." },

  { match: /octmnist|privacy|distillation|dataset distill/i,
    reply: "OCTMNIST privacy distillation ✦\n• AASIP 2024\n• Privacy-preserving dataset distillation on retinal OCT scans\n• Keeps utility, sheds identifiable signal\n*nose boop* small dataset, big idea." },

  // ── Projects overall ──────────────────────────────────────────────────
  { match: /project(s)?|portfolio|works|build something|what.*build/i,
    reply: "Projects ✦\n• Digital Human — dementia-care companion\n• Plant Disease — Grad-CAM + LLM (91% accuracy)\n• Fridge Clear — vibe-coded fridge helper\n• Plus the 3 research builds (PathMNIST / OCTMNIST / Rejection)\n*spin* scroll to /projects to play with them." },

  // ── Individual projects ───────────────────────────────────────────────
  { match: /digital human|dementia|companion|elderly/i,
    reply: "Digital Human ✦\n• AI companion for dementia care\n• Speech + memory cues + gentle nudges\n• Built with LLM + TTS pipeline\n*tail wag* warmest project on the list." },

  { match: /plant|disease|grad[- ]?cam|leaf|crop/i,
    reply: "Plant Disease classifier ✦\n• 91% accuracy on the test set\n• Grad-CAM heatmaps for explainability\n• LLM advice layer for what-to-do-next\n*ears up* CV + LLM in one shot." },

  { match: /fridge|清冰箱|recipe|leftover|vibe[- ]?cod/i,
    reply: "Fridge Clear ✦\n• Snap the fridge → get recipe suggestions\n• Vibe-coded one-evening build\n• Practical, silly, surprisingly useful\n*spins* fastest one to ship." },

  // ── Skills ────────────────────────────────────────────────────────────
  { match: /skill|stack|tech|code|tools|language|框架/i,
    reply: "Skills ✦\n• Product — PRD, LLM eval, data instrumentation, comp analysis\n• Engineering — Python, Java / Spring Boot, MyBatis, Spark / Hive, Next.js\n• Research — LLMs, robustness, medical imaging\n*sit pretty* three lanes, one head." },

  // ── Running / video ───────────────────────────────────────────────────
  { match: /run(ning)?|marathon|29m|viral|video|douyin|抖音|跑步/i,
    reply: "Running ✦\n• Started running as a daily reset\n• One run vlog hit ~29M views on Douyin\n• Keeps him sane between PRDs and papers\n*zoomies* go-go-go." },

  // ── Hobbies / travel ──────────────────────────────────────────────────
  { match: /hobb|travel|photo|fun|outside work|spare time|爱好|旅行/i,
    reply: "Off-screen ✦\n• Travel + film photography (Portra fan)\n• Long runs, slow coffee\n• Notebook sketches for product ideas\n*tail wag* the three sides on /contact." },

  // ── Contact ───────────────────────────────────────────────────────────
  { match: /contact|email|reach|wechat|connect|微信|找他/i,
    reply: "Contact ✦\n• Email — 1234946@wku.edu.cn\n• WeChat — Bingoowin\n• Phone — on the /contact pills\n• Resume — top-right of the homepage\n*ears up* he replies within ~24h." },

  // ── Phone ─────────────────────────────────────────────────────────────
  { match: /phone|call|number|电话/i,
    reply: "Phone ✦\n• Listed on the /contact pill row\n• Click the phone pill to dial directly\n*head tilt* texting is fine too." },

  // ── Resume ────────────────────────────────────────────────────────────
  { match: /resume|cv|download|pdf|简历/i,
    reply: "Resume ✦\n• Top-right of the homepage → 'Resume'\n• Auto-picks EN or ZH by site language\n• Always the latest version\n*nose boop* one click away." },

  // ── Hire / recruit ────────────────────────────────────────────────────
  { match: /hire|recruit|opportun|open to work|available/i,
    reply: "Open to ✦\n• AI PM + AI engineering chats\n• Especially after Yale '26\n• Email or WeChat both work\n*tail wag* he likes meeting people." },

  // ── Location ──────────────────────────────────────────────────────────
  { match: /where.*(live|based|located|now)|location|city|country|哪里/i,
    reply: "Where ✦\n• Based in China for now (Wenzhou / Hangzhou)\n• Moving to New Haven, CT for Yale in Fall 2026\n*ears perked* timezone shift incoming." },

  // ── Languages ─────────────────────────────────────────────────────────
  { match: /language|chinese|english|bilingual|中英/i,
    reply: "Languages ✦\n• Chinese (native) · English (fluent)\n• Site has a EN ↔ ZH toggle in the navbar\n*head tilt* tap it any time." },

  // ── Site navigation ───────────────────────────────────────────────────
  { match: /how.*(navigate|use|site|page)|where.*(section|part)|navbar|menu/i,
    reply: "Site map ✦\n• About — the human bits\n• Internships — the experience trail map\n• Projects — research + builds\n• Contact — three sides + pills\n*spins* navbar links smooth-scroll." },

  // ── Why the pet ───────────────────────────────────────────────────────
  { match: /why.*pet|why.*mascot|why.*you exist/i,
    reply: "Why I'm here ✦\n• Bingo's site has a lot in it\n• I'm the shortcut — ask anything site-related\n• I also do happy / love / sad moods if you stick around\n*tail wag* hi friend." },
];

export const FAQ_ROUTES_ZH: Route[] = [
  // ── 自我介绍 ──────────────────────────────────────────────────────────
  { match: /他是谁|是谁|介绍|自我介绍|关于他|关于你|tell me/i,
    reply: "关于 Bingo ✦\n• 孙徐斌（Bingo） —— 2026 秋季入读耶鲁 CS 硕士\n• 当前在 Zoom 做 AI 产品经理实习\n• 3 篇 SCI 论文 · 4 段实习 · 6 所 offer\n*摇尾巴* 产品 + 工程 + 研究，一个人三个能力。" },

  // ── 宠物自己 ──────────────────────────────────────────────────────────
  { match: /你是谁|你叫|宠物|你好可爱|你是什么/i,
    reply: "关于我 ✦\n• 我是 Bingo 的像素宠物，也是网站讲解员\n• 随时点我，我帮你找答案\n• 多摸我几下我会激动到原地转圈\n*原地转圈*" },

  // ── 耶鲁 + 全部 offer ─────────────────────────────────────────────────
  { match: /耶鲁|yale|读研|硕士|出国|什么时候|去哪/i,
    reply: "读研 ✦\n• 耶鲁大学 —— 计算机科学硕士，2026 秋季入学\n• 同时拿到 CMU、Columbia、Cornell、Northwestern、UCL 的 offer\n• 选耶鲁是因为研究氛围 + 社群更合\n*耳朵立起来* 大年份。" },

  { match: /cmu|columbia|cornell|northwestern|ucl|其他.*(offer|学校)|别的|还有哪/i,
    reply: "其他 offer ✦\n• CMU · Columbia · Cornell · Northwestern · UCL\n• 全部 CS / 数据方向硕士\n• 最后选了耶鲁\n*骄傲地汪一声*" },

  // ── 本科 ──────────────────────────────────────────────────────────────
  { match: /本科|学校|温肯|wku|温州|kean/i,
    reply: "本科 ✦\n• 温州肯恩大学 —— 计算机科学学士，2022–2026\n• 美式课程，中美合办校区\n• 同时做过 TA + 图书馆 IT 助理\n*摇尾巴* 打底子的四年。" },

  // ── Zoom（当前）─────────────────────────────────────────────────────
  { match: /zoom|现在|当前|现在.*实习|目前/i,
    reply: "Zoom — 当前实习 ✦\n• AI 产品经理实习生，2025 年 12 月至今\n• 从 0 到 1 主导 AI 功能的 PRD 与上线\n• 搭了一套 LLM-Judge 评测体系给 Zoom Present\n*挺起小胸膛* 现在的主战场。" },

  // ── 阿里 ──────────────────────────────────────────────────────────────
  { match: /阿里|alibaba|aliyun|dataphin|瓴羊|storylane/i,
    reply: "阿里云 — 瓴羊 Dataphin ✦\n• 三个月，产品 + GTM\n• 产出 50+ 交互式产品 Demo\n• 搭了渠道漏斗看板\n• 对接 Storylane 加州团队\n*蹭一下* 云端那一段。" },

  // ── 德勤 ──────────────────────────────────────────────────────────────
  { match: /德勤|deloitte|sap|spring boot|mybatis|xxl/i,
    reply: "德勤 — SAP 项目 ✦\n• 三个月，Java 后端\n• Spring Boot + MyBatis + XXL-JOB\n• 负责供应商质量、薪酬等模块\n• 写了钉钉自动化推送\n*端正坐好* 企业级严谨。" },

  // ── 朋辉 ──────────────────────────────────────────────────────────────
  { match: /朋辉|penghui|第一份|大数据|智谱|llm.*接入/i,
    reply: "朋辉大数据 — 第一份实习 ✦\n• 2024 年夏天，第一次真刀真枪\n• 把智谱大模型接入标准化服务链路\n• 写 Spark / Hive 数据任务\n• 从'写任务'变成'有产品判断'的起点\n*摇尾巴* 起点故事。" },

  // ── 论文总览 ──────────────────────────────────────────────────────────
  { match: /论文|paper|publication|sci|q1|研究总览|发表/i,
    reply: "论文（3 篇）✦\n• SCI Q1 —— LLM 负向拒识综述（2025）\n• ICCGIV 2024 —— PathMNIST 鲁棒性研究\n• AASIP 2024 —— OCTMNIST 隐私数据集蒸馏\n*端正坐好* 同行评审过的硬货。" },

  // ── 单篇论文 ──────────────────────────────────────────────────────────
  { match: /拒识|拒绝|reject|幻觉|hallucinat|refus/i,
    reply: "LLM 负向拒识综述 ✦\n• SCI Q1 期刊，2025 发表\n• 梳理大模型「该拒答 vs 该回答」的边界\n• 覆盖基准、分类法与缓解方法\n*耳朵立起来* 最重的一篇。" },

  { match: /pathmnist|鲁棒|医学影像|病理/i,
    reply: "PathMNIST 鲁棒性 ✦\n• ICCGIV 2024\n• 在病理图像扰动下测视觉模型\n• 合作论文，他的第一篇会议\n*摇尾巴* 医学影像。" },

  { match: /octmnist|隐私|蒸馏|视网膜|oct/i,
    reply: "OCTMNIST 隐私蒸馏 ✦\n• AASIP 2024\n• 在视网膜 OCT 上做隐私保留的数据集蒸馏\n• 保住效用，去掉可识别信号\n*蹭一下* 小数据，大想法。" },

  // ── 项目总览 ──────────────────────────────────────────────────────────
  { match: /项目|product|portfolio|作品|做过什么|build|建过/i,
    reply: "项目 ✦\n• 数字人 —— 痴呆症陪伴助手\n• 植物病害分类 —— Grad-CAM + LLM（91% 准确率）\n• 清冰箱 —— Vibe Coding 一晚出活\n• 还有三个研究项目（PathMNIST / OCTMNIST / 拒识）\n*转圈* 去 /projects 直接玩。" },

  // ── 单个项目 ──────────────────────────────────────────────────────────
  { match: /数字人|digital human|痴呆|陪伴|老人/i,
    reply: "数字人 ✦\n• 痴呆症人群的 AI 陪伴助手\n• 语音 + 记忆提示 + 温和提醒\n• LLM + TTS 串起来\n*摇尾巴* 这是最暖的一个。" },

  { match: /植物|病害|plant|disease|grad[- ]?cam|叶/i,
    reply: "植物病害分类 ✦\n• 测试集 91% 准确率\n• Grad-CAM 热力图做可解释性\n• LLM 给出该怎么处理的建议\n*耳朵立起来* CV + LLM 一把出。" },

  { match: /冰箱|清冰箱|fridge|食谱|vibe/i,
    reply: "清冰箱 ✦\n• 拍一下冰箱 → 得到食谱建议\n• Vibe Coding 一晚搞定\n• 实用、傻、又意外好用\n*转圈* 出活最快的一个。" },

  // ── 技能 ──────────────────────────────────────────────────────────────
  { match: /技能|栈|stack|skill|代码|工具|语言|框架/i,
    reply: "技能 ✦\n• 产品 —— PRD、LLM 评测、数据埋点、竞品分析\n• 工程 —— Python、Java / Spring Boot、MyBatis、Spark / Hive、Next.js\n• 研究 —— 大模型、鲁棒性、医学影像\n*端正坐好* 三条道，一个脑。" },

  // ── 跑步 / 视频 ───────────────────────────────────────────────────────
  { match: /跑步|run|marathon|29|抖音|视频|爆款|短视频/i,
    reply: "跑步 ✦\n• 跑步是他的日常重置键\n• 一条跑步 vlog 在抖音拿到 2900 万 + 播放\n• PRD 和论文之间用来续命\n*狂奔* 冲冲冲。" },

  // ── 兴趣 ──────────────────────────────────────────────────────────────
  { match: /兴趣|爱好|旅行|摄影|hobb|travel|photo|玩什么/i,
    reply: "屏幕外 ✦\n• 旅行 + 胶片摄影（Portra 党）\n• 长跑、慢咖啡\n• 笔记本上画产品点子\n*摇尾巴* /contact 上的三面。" },

  // ── 联系方式 ──────────────────────────────────────────────────────────
  { match: /联系|邮箱|email|微信|wechat|找他/i,
    reply: "联系 ✦\n• 邮箱 —— 1234946@wku.edu.cn\n• 微信 —— Bingoowin\n• 电话 —— /contact 胶囊里\n• 简历 —— 主页右上角\n*耳朵立起来* 一般 24 小时内回。" },

  // ── 电话 ──────────────────────────────────────────────────────────────
  { match: /电话|号码|phone|手机/i,
    reply: "电话 ✦\n• /contact 区的胶囊里有\n• 点电话胶囊直接拨\n*歪头* 发短信也行。" },

  // ── 简历 ──────────────────────────────────────────────────────────────
  { match: /简历|cv|resume|下载|pdf/i,
    reply: "简历 ✦\n• 主页右上角 → 'Resume'\n• 中文站给中文版，英文站给英文版\n• 永远是最新版\n*蹭一下* 一键拿走。" },

  // ── 招聘 ──────────────────────────────────────────────────────────────
  { match: /招|hire|机会|offer|内推|工作机会/i,
    reply: "在找 ✦\n• AI PM / AI 工程方向\n• 尤其是 2026 秋季之后\n• 邮件或微信都行\n*摇尾巴* 他喜欢认识新朋友。" },

  // ── 地点 ──────────────────────────────────────────────────────────────
  { match: /哪里|在哪|城市|where|住在|位置/i,
    reply: "在哪 ✦\n• 目前在国内（温州 / 杭州一带）\n• 2026 秋去美国 New Haven 读耶鲁\n*耳朵立起来* 时区即将切换。" },

  // ── 语言 ──────────────────────────────────────────────────────────────
  { match: /语言|中英|中文|英语|english|chinese/i,
    reply: "语言 ✦\n• 中文母语 · 英语流利\n• 网站导航栏有 EN ↔ ZH 切换\n*歪头* 随时切。" },

  // ── 网站导航 ──────────────────────────────────────────────────────────
  { match: /怎么.*(用|看|逛)|网站.*哪|导航|菜单|页面/i,
    reply: "网站地图 ✦\n• 关于 —— 人的部分\n• 实习 —— 实习地图\n• 项目 —— 研究 + 作品\n• 联系我 —— 三面 + 联系方式\n*转圈* 导航栏点哪儿滑哪儿。" },

  // ── 宠物存在的意义 ────────────────────────────────────────────────────
  { match: /为什么.*(你|宠物)|你存在|你来干嘛/i,
    reply: "我为什么在这 ✦\n• Bingo 的网站内容比较多\n• 我是快捷方式，问我就行\n• 你陪我久一点我还会有开心 / 喜欢 / 难过的小情绪\n*摇尾巴* 你好呀朋友。" },
];

export function faqReply(message: string, lang: "en" | "zh"): string {
  const routes = lang === "zh" ? FAQ_ROUTES_ZH : FAQ_ROUTES_EN;
  for (const r of routes) {
    if (r.match.test(message)) return r.reply;
  }
  return lang === "zh"
    ? "这个我也不太确定 —— 这种问题最好直接问徐斌本人。邮箱在页面底部 (1234946@wku.edu.cn)，他通常 24 小时内回。*歪头*"
    : "I'm not sure on that one — best to ask Xubin directly. His email's at the bottom of the page (1234946@wku.edu.cn) and he usually replies within 24h. *head tilt*";
}
