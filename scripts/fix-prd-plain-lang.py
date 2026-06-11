#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
PRD 白话化清理脚本 - 第二轮
清理所有残留的技术术语、代码表达式、CSS 样式值、函数名等
"""

import os
import re
import glob

BASE_DIR = os.path.join(os.path.dirname(__file__), "..")
PRD_DIR = os.path.join(BASE_DIR, "docs", "prd")

def fix_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    original = content

    # ========== 1. 代码表达式 / 条件判断 ==========
    # vehicles.length > 1 → 删除括号内容
    content = re.sub(r'\(vehicles\.length\s*>\s*1\)', '', content)
    content = re.sub(r'\(allOrders\.length\)', '', content)
    content = re.sub(r'\(getProviderPendingOrders\(\)\.length\)', '（待处理订单数量）', content)
    content = re.sub(r'\(getProviderProcessingOrders\(\)\.length\)', '（进行中订单数量）', content)
    content = re.sub(r'\(shipped\)', '', content)
    content = re.sub(r'\(record模式\)', '（记录查看模式）', content)
    content = re.sub(r'\(compact\s+模式\)', '（紧凑模式）', content)

    # ========== 2. state 变量 ==========
    # state.userGarage.selectedVehicle → 当前选中车辆
    content = re.sub(r'`?state\.userGarage\.selectedVehicle`?', '当前选中车辆', content)
    content = re.sub(r'`?state\.userForum\.selectedPost`?', '当前选中帖子', content)
    content = re.sub(r'`?state\.tab\s*=\s*"messages"`?', '切换至消息中心', content)
    content = re.sub(r'`?state\.tab\s*=\s*"[^"]*"`?', '切换对应页面', content)
    content = re.sub(r'\bstate\.[a-zA-Z_]+\b', '页面状态', content)

    # ========== 3. data-user-action / data 属性 ==========
    # data-user-action="user-vehicle-select" → 车辆切换选择
    content = re.sub(r'`?data-user-action="user-vehicle-select"`?', '车辆切换下拉选择', content)
    content = re.sub(r'`?data-user-action="user-mall-category"`?', '商品分类切换', content)
    content = re.sub(r'`?data-user-action="user-forum-category"`?', '帖子分类切换', content)
    content = re.sub(r'`?data-user-action="user-forum-like"`?', '点赞按钮', content)
    content = re.sub(r'`?data-user-action="user-forum-comment-delete"`?', '删除评论操作', content)
    content = re.sub(r'`?data-user-action="user-garage-exterior"`?', '外观改装入口', content)
    content = re.sub(r'`?data-user-action="[^"]*"`?', '交互操作', content)
    content = re.sub(r'`?data-user-auth-mode="smsLogin"`?', '手机短信登录模式', content)
    content = re.sub(r'`?data-provider-case-field="content"`?', '案例内容字段', content)

    # ========== 4. renderXxx 函数名 ==========
    content = re.sub(r'`?renderServiceChatPage\s*\+\s*renderSidebar`?', '重新加载客服对话页面与侧边栏', content)
    content = re.sub(r'`?renderServiceChatPage`?', '客服对话页面', content)
    content = re.sub(r'`?renderSidebar`?', '侧边栏', content)
    content = re.sub(r'`?renderTablePage`?', '表格管理页面', content)
    content = re.sub(r'`?renderSimplePage`?', '简化表格页面', content)
    content = re.sub(r'`?renderOrderTable`?', '订单列表', content)
    content = re.sub(r'`?renderUserMallDetail`?', '商品详情展示', content)
    content = re.sub(r'`?renderUserForumCreateForm`?', '快速发帖表单', content)
    content = re.sub(r'`?renderUserForumDetail`?', '帖子详情展示', content)
    content = re.sub(r'`?renderProviderForumDetail`?', '帖子管理面板', content)
    content = re.sub(r'`?renderProviderPurchaseDetail`?', '商品采购详情', content)
    content = re.sub(r'`?renderProviderPurchaseForm`?', '采购表单', content)
    content = re.sub(r'`?renderProviderProductDetail`?', '商品详情面板', content)
    content = re.sub(r'`?renderProviderCaseDetail`?', '案例详情面板', content)
    content = re.sub(r'`?renderProviderCaseForm`?', '案例编辑表单', content)
    content = re.sub(r'`?renderProviderModeratorForm`?', '版主申请表单', content)
    content = re.sub(r'`?renderProviderDialog`?', '操作确认对话框', content)
    content = re.sub(r'`?renderProviderCompleteForm`?', '完工确认表单', content)
    content = re.sub(r'`?renderProviderProfileForm`?', '个人资料表单', content)
    content = re.sub(r'`?renderAdminOrderDetail`?', '订单详情面板', content)
    content = re.sub(r'`?renderAdminProviderDetail`?', '服务商详情面板', content)
    content = re.sub(r'`?renderAdminProviderDetailPage`?', '服务商完整详情页', content)
    content = re.sub(r'`?renderAdminCaseDetail`?', '案例详情面板', content)
    content = re.sub(r'`?renderAdminForumDetail`?', '帖子详情面板', content)
    content = re.sub(r'`?renderCaseCoverPreview`?', '封面图预览', content)
    content = re.sub(r'`?renderVisitorMonitorPage`?', '访客监控页面', content)
    content = re.sub(r'`?renderDashboard`?', '工作台首页', content)
    content = re.sub(r'`?renderForumManagePage`?', '论坛管理页面', content)
    content = re.sub(r'`?renderUserAuth`?', '登录注册页面', content)
    content = re.sub(r'`?renderUserCredit`?', '金融授信页面', content)
    content = re.sub(r'`?renderUserMe`?', '个人中心页面', content)
    content = re.sub(r'`?renderUserInvoices`?', '发票管理页面', content)
    content = re.sub(r'`?renderUserGarageVehicles`?', '爱车管理页面', content)
    content = re.sub(r'`?renderUserOrders`?', '订单列表页面', content)
    content = re.sub(r'`?renderUserOrderDetail`?', '订单详情页面', content)
    content = re.sub(r'`?renderUserMessages`?', '消息中心页面', content)
    content = re.sub(r'`?renderUserForum`?', '社区首页页面', content)
    content = re.sub(r'`?renderUserMallHome`?', '商城首页页面', content)
    content = re.sub(r'`?renderUserCaseDetail`?', '案例详情页面', content)
    content = re.sub(r'`?renderUserNewsDetail`?', '资讯详情页面', content)
    content = re.sub(r'`?renderUserProductDetail`?', '商品详情页面', content)
    content = re.sub(r'`?renderProviderHome`?', '服务商首页', content)
    content = re.sub(r'`?renderProviderOrders`?', '服务商订单页面', content)
    content = re.sub(r'`?renderProviderOperations`?', '服务商运营页面', content)
    content = re.sub(r'`?renderProviderMessages`?', '服务商消息页面', content)
    content = re.sub(r'`?renderProviderMe`?', '服务商个人中心', content)
    content = re.sub(r'`?renderShowcasePage`?', '门店展示页面', content)
    content = re.sub(r'`?renderCaseManagePage`?', '案例管理页面', content)
    content = re.sub(r'`?renderJoinPage`?', '入驻申请页面', content)
    content = re.sub(r'`?renderAdmin`?', '管理员工作台', content)
    content = re.sub(r'`?render[^`\s(]+`?', '页面展示', content)

    # ========== 5. getXxx 函数名 ==========
    content = re.sub(r'`?getMockUserAuth\(\)`?', '当前登录用户信息', content)
    content = re.sub(r'`?getProviderPendingOrders\(\)`?', '待处理订单', content)
    content = re.sub(r'`?getProviderProcessingOrders\(\)`?', '进行中订单', content)
    content = re.sub(r'`?getNowStamp\(\)`?', '当前时间', content)
    content = re.sub(r'`?getPageViewLabel\([^)]+\)`?', '浏览量统计', content)
    content = re.sub(r'`?getActionCountLabel\([^)]+\)`?', '互动数据统计', content)

    # ========== 6. 对象属性 / 字段名 ==========
    content = re.sub(r'`?vehicle\.history`?', '车辆历史记录', content)
    content = re.sub(r'`?item\.content`?', '帖子正文内容', content)
    content = re.sub(r'`?posts`/?`comments`\s+数组', '帖子与评论数据', content)
    content = re.sub(r'内存中的\s+`?posts`/?`?comments`?\s+数组', '内存中的帖子与评论数据', content)

    # ========== 7. mock / 数据生成 ==========
    content = re.sub(r'`?mock\s+生成`?', '示例数据', content)
    content = re.sub(r'`?mock-data\.js`?', '数据文件', content)
    content = re.sub(r'`?window\.MockData`?', '平台数据', content)
    content = re.sub(r'`?MockData`?', '数据', content)
    content = re.sub(r'`?mock`?', '示例', content)

    # ========== 8. CSS / 样式值 ==========
    # min-height:200px → 固定高度展示区域
    content = re.sub(r'`?min-height:\s*200px`?', '固定高度展示区域', content)
    content = re.sub(r'`?min-height:\s*100%`?', '全高区域', content)
    content = re.sub(r'`?backdrop-filter:\s*blur\(8px\)`?', '背景模糊效果', content)
    content = re.sub(r'`?rgba\(255,106,0,0\.06\)`?', '浅橙色背景', content)
    content = re.sub(r'`?3px\s+solid\s+#ff6a00`?', '橙色左边框', content)
    content = re.sub(r'`?28px`?', '大号字体', content)
    content = re.sub(r'`?180px`?', '固定高度', content)
    content = re.sub(r'`?340px`?', '固定宽度', content)
    content = re.sub(r'`?12px`?', '圆角', content)
    content = re.sub(r'`?22px`?', '大圆角', content)
    content = re.sub(r'`?0\.55px`?', '对应比例', content)
    content = re.sub(r'`?1\.3px`?', '对应比例', content)
    # 通用 px 值（保留在数字+px 后面跟中文的情况，替换为描述）
    content = re.sub(r'\(\s*\d+px\s*，', '（', content)
    content = re.sub(r'，\s*\d+px\s*\)', '）', content)

    # ========== 9. 其他技术术语 ==========
    content = re.sub(r'`?localStorage`?', '本地存储', content)
    content = re.sub(r'`?浏览器本地缓存`?', '本地记录', content)
    content = re.sub(r'`?页面渲染`?', '页面展示', content)
    content = re.sub(r'`?页面状态`?', '当前页面', content)
    content = re.sub(r'`?系统数据`?', '平台数据', content)
    content = re.sub(r'`?用户认证信息`?', '用户登录状态', content)
    content = re.sub(r'`?原型数据`?', '示例数据', content)
    content = re.sub(r'`?URL`?', '链接', content)
    content = re.sub(r'`?HTML`?', '网页内容', content)
    content = re.sub(r'`?CSS`?', '样式', content)
    content = re.sub(r'`?JSON`?', '数据格式', content)
    content = re.sub(r'`?API`?', '接口', content)
    content = re.sub(r'`?SPA`?', '单页面应用', content)
    content = re.sub(r'`?DOM`?', '页面元素', content)

    # ========== 10. 文件路径 / 代码文件 ==========
    content = re.sub(r'`?assets/js/[^`\s]+`?', '前端脚本', content)
    content = re.sub(r'`?assets/css/[^`\s]+`?', '样式文件', content)
    content = re.sub(r'`?pages/[^`\s]+`?', '独立页面', content)
    content = re.sub(r'`?visitor-stats\.js`?', '统计脚本', content)
    content = re.sub(r'`?mobile-app\.js`?', '主应用脚本', content)
    content = re.sub(r'`?platform-web\.js`?', '平台端脚本', content)
    content = re.sub(r'`?provider-web\.js`?', '服务商网页脚本', content)
    content = re.sub(r'`?brand-web\.js`?', '品牌网页脚本', content)
    content = re.sub(r'`?mock-data\.js`?', '数据文件', content)

    # ========== 11. 清理残留的空括号、多余空格 ==========
    content = re.sub(r'（\s*）', '', content)
    content = re.sub(r'\(\s*\)', '', content)
    content = re.sub(r'  +', ' ', content)
    content = re.sub(r' ，', '，', content)
    content = re.sub(r'。 ', '。', content)
    content = re.sub(r'\n{3,}', '\n\n', content)

    if content != original:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        return True
    return False


def main():
    files = glob.glob(os.path.join(PRD_DIR, "**/*.md"), recursive=True)
    modified = 0
    for filepath in files:
        if fix_file(filepath):
            modified += 1
            print(f"已修改: {filepath}")
    print(f"\n共修改 {modified}/{len(files)} 个文件")


if __name__ == "__main__":
    main()
