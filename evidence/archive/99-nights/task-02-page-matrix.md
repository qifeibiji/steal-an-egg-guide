# NON-CANONICAL / TASK_COMPLETION_EVIDENCE

# 关卡 2：99 Nights in the Forest MVP 页面矩阵

- 规划日期：2026-08-25
- 范围：1 个首页、1 个 guide/wiki hub、8 个优先内容页。
- 原则：优先解决已有公开需求证据的问题；不以单个同义词拆出薄页面；不开始写完整文章。

| # | Proposed URL slug | Primary keyword | Secondary keywords | User question | Search intent | Page type | Update sensitivity | Internal-link target | Why this page deserves to exist | MVP status |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | `/` | `99 nights in the forest guide` | beginner guide; survival tips; classes; campfire | 这个站能帮我解决哪些 99 Nights 问题？ | Navigational / informational | Homepage | Medium | `/guides/` + 全部 P1 页面 | 承接主主题并把用户导向具体问题，避免与头词 wiki 硬碰。 | Include |
| 2 | `/guides/` | `99 nights in the forest wiki guide` | classes; items; crafting; Deer; Diamonds | 我需要哪一类攻略？ | Navigational / reference | Guide / wiki hub | High | 全部 P1 页面 | 组织页面矩阵并给更新敏感内容一个明确归位。 | Include |
| 3 | `/guides/classes/` | `99 nights in the forest classes` | best class; class tier list; beginner class | 职业怎么选，单人/组队/新手适合什么？ | Informational / comparison | Decision guide | High | `/guides/`, `/guides/diamonds/`, `/guides/beginner-survival/` | 多个真实查询集中在 class、best class、tier list；应合并成一个维护页。 | Include |
| 4 | `/guides/beginner-survival/` | `99 nights in the forest beginner guide` | survival tips; how to survive | 第一局的资源、夜晚与风险优先级是什么？ | Informational / how-to | Beginner guide | Medium | `/guides/`, `/guides/campfire/`, `/guides/crafting/`, `/guides/deer/` | 是最清晰的首局需求入口；与 survival tips 合并避免重复。 | Include |
| 5 | `/guides/campfire/` | `99 nights in the forest campfire` | campfire guide; campfire upgrade; fuel | 篝火有什么用，如何安全升级与维持？ | Informational / how-to | Mechanic guide | High | `/guides/`, `/guides/beginner-survival/`, `/guides/crafting/`, `/guides/deer/` | 是安全区、升级与探索节奏的核心机制，有直接 Wiki 和攻略来源。 | Include |
| 6 | `/guides/crafting/` | `99 nights in the forest crafting` | materials; crafting bench; essential crafts | 哪些材料和制作选择值得优先做？ | Informational / how-to | Mechanic guide | High | `/guides/`, `/guides/campfire/`, `/guides/items/` | 真实机制页且与 campfire / item 形成强内链。 | Include |
| 7 | `/guides/deer/` | `99 nights in the forest deer` | The Deer; night survival; safe zone | Deer 在何时危险，夜晚怎么降低风险？ | Informational / how-to | Entity guide | Medium | `/guides/`, `/guides/campfire/`, `/guides/beginner-survival/`, `/guides/missing-children/` | 首屏实体词需求明确，能回答一个具体、可验证的问题。 | Include |
| 8 | `/guides/missing-children/` | `99 nights in the forest missing children` | rescue kids; locked caves; child progression | 失踪孩子的目标、推进与救援线索是什么？ | Informational / how-to | Objective guide | High | `/guides/`, `/guides/campfire/`, `/guides/deer/` | 这是游戏主线目标之一，有两个结构化 Wiki 来源。 | Include |
| 9 | `/guides/diamonds/` | `99 nights in the forest diamonds` | gems; earn diamonds; badges rewards | Diamonds 从哪里来、优先花在什么地方？ | Informational / decision | Currency guide | High | `/guides/`, `/guides/classes/` | 与 class 页面形成自然的“获得—消费”路径。 | Include |
| 10 | `/guides/items/` | `99 nights in the forest items` | chests; materials; item uses | 常见物品、材料和箱子能提供什么？ | Reference / informational | Lightweight item reference | High | `/guides/`, `/guides/crafting/`, `/guides/diamonds/` | 先做可维护的基础索引，不承诺全量百科。 | Include |

## 延后页面（不进入第一版 MVP）

| Candidate page | Supporting keyword | Status | Reason |
| --- | --- | --- | --- |
| `/guides/animal-taming/` | animal taming | Defer | 有公开需求和来源，但 8 个优先内容页已满，且动物/食物/Flute 变动快。 |
| `/guides/hard-mode/` | hard mode | Defer | 机制、奖励与开启条件高度更新敏感。 |
| `/guides/badges/` | badges | Defer | 清单维护成本高，需要每次活动后重核。 |
| `/guides/biomes/` | biomes | Defer | 存在需求，但适合在核心生存闭环完成后扩写。 |
| `/guides/offerings/` | offerings | Defer | 是较新且更新敏感的系统，MVP 暂不承担细节维护。 |
| `/guides/codes/` | codes | `SOURCE_INSUFFICIENT` | 未取得官方 / 开发者维护的当前有效代码清单。 |

## 内链规则（第一版）

1. 首页只做主题定位和导航，不争抢所有问题词。
2. `/guides/` 连接全部优先页；每个内容页回链到 hub。
3. `classes ↔ diamonds`、`campfire ↔ crafting ↔ items`、`beginner ↔ campfire ↔ Deer`、`missing children ↔ Deer` 构成明确主题簇。
4. 所有更新敏感页在发布前复核来源日期；无可靠来源的内容不发布。
