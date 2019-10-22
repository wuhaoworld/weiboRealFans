window.addEventListener('click', function (event) {
    main();
})

jQuery.fn.wait = function (func, selector, times, interval) {
    var _times = times || 100, //100次
        _interval = interval || 600, //100毫秒每次
        _self = this,
        _selector = selector, //选择器
        _iIntervalID; //定时器id
    if (this.length) { //如果已经获取到了，就直接执行函数
        func && func.call(this);
    } else {
        _iIntervalID = setInterval(function () {
            if (!_times) { //是0就退出
                clearInterval(_iIntervalID);
            }
            _times <= 0 || _times--; //如果是正数就 --
            _self = $(_selector); //再次选择
            if (_self.length) { //判断是否取到
                func && func.call(_self);
                clearInterval(_iIntervalID);
            }
        }, _interval);
    }
    return this;
}

function main() {
    let isExits = $('#wb_fans_helper_0312');
    if (isExits.length > 0) {
        return;
    }
    // 页面全局右上角的个人账号昵称
    let selfUserName = $('.gn_nav_list li:last a .S_txt1').html();
    let currentUsername = $('h1[class="username"]').html();
    // 如果是个人主页
    if (selfUserName == currentUsername) {
        $('a[action-data*="mid"][action-type="fl_pop"]').wait(function () {
            let midString = $('a[action-data*="mid"][action-type="fl_pop"]').attr('action-data');
            midString = midString.substr(4, midString.indexOf("&") - 4);

            let seftUidString = $('.WB_innerwrap .S_line1 a').attr('href');
            let uid = seftUidString.substr(seftUidString.indexOf("weibo.com") + 10, seftUidString.indexOf("follow") - 13)

            let selfApiUrl = `https://pay.biz.weibo.com/aj/getprice/fanstop?uid=${uid}&mid=${midString}&pretend=`;
            $.ajax({
                url: selfApiUrl,
                success: function (res) {
                    let result = res.data.default.count;
                    let userInfo = {};
                    userInfo['remaining'] = parseInt(result);
                    userInfo['followers'] = res.data.followers_count;
                    userInfo['real_percent'] = Math.round(userInfo['remaining'] * 10000 / userInfo['followers']) / 100;
                    userInfo['real_percent'] = userInfo['real_percent'].toFixed(2);
                    userInfo['water_percent'] = (100 - userInfo['real_percent']).toFixed(2);

                    let tpl = getTplHtml(userInfo);
                    $(".PCD_counter .WB_innerwrap").wait(function () {
                        $('.PCD_counter .WB_innerwrap').append(tpl);
                    }, '.PCD_counter .WB_innerwrap');
                }
            });
        }, 'a[action-data*="mid"][action-type="fl_pop"]');
        return;
    }

    if (currentUsername) {
        //通过元素判断是微博详情页
        let currentUsernameEncode = encodeURIComponent(currentUsername);
        $.ajax({
            url: `https://pay.biz.weibo.com/aj/designate/searchusers?keyword=${currentUsernameEncode}`,
            success: function (res) {
                let result = res.data;
                let firstUser = result.find(function (element) {
                    return element.screen_name == currentUsername;
                });
                let userInfo = {};
                userInfo['screen_name'] = firstUser['screen_name'];
                userInfo['remaining'] = parseInt(firstUser['remaining'].substr(0, firstUser['remaining'].length - 3));
                userInfo['followers'] = firstUser['followers'];
                userInfo['real_percent'] = Math.round(userInfo['remaining'] * 10000 / userInfo['followers']) / 100;
                userInfo['real_percent'] = userInfo['real_percent'].toFixed(2);
                userInfo['water_percent'] = (100 - userInfo['real_percent']).toFixed(2);
                let tpl = getTplHtml(userInfo);
                if (currentUsername == userInfo['screen_name']) {
                    $(".PCD_counter .WB_innerwrap").wait(function () {
                        $('.PCD_counter .WB_innerwrap').append(tpl);
                    }, '.PCD_counter .WB_innerwrap');
                } else {
                    // 账号太小，找不到有效数据
                }
            },
            error: function (res) { },
        });
    }
}

$(document).ready(function () {
    main();
});

function getTplHtml(userInfo) {
    let tpl = `<hr style="height: 1px; background-color: #ddd; margin: 10px; border: 0;"/>
    <table id="wb_fans_helper_0312" class="tb_counter" cellpadding="0" cellspacing="0">
<tbody>
    <tr>
        <td class="S_line1">
            <a bpfilter="page_frame" class="t_link S_txt1" href="https://shimo.im/docs/H3rVCk3rjWd3KjKh" target="_blank">
                <strong class="W_f14">
                    ${userInfo['remaining']}
                </strong>
                <span class="S_txt2">
                    活跃粉丝
                </span>
            </a>
        </td>
        <td class="S_line1">
            <a bpfilter="page_frame" class="t_link S_txt1" href="https://shimo.im/docs/H3rVCk3rjWd3KjKh" target="_blank">
                <strong class="W_f14">
                    ${userInfo['real_percent']}%
                </strong>
                <span class="S_txt2">
                    活跃粉丝比例
                </span>
            </a>
        </td>
        <td class="S_line1">
            <a bpfilter="page_frame" class="t_link S_txt1" href="https://shimo.im/docs/H3rVCk3rjWd3KjKh" target="_blank">
                <strong class="W_f14">
                    ${userInfo['water_percent']}%
                </strong>
                <span class="S_txt2">
                    非活跃粉丝比例
                </span>
            </a>
        </td>
    </tr>
</tbody>
</table>`;
    return tpl;
}