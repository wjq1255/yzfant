import { Injectable, Injector, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MenuService, SettingsService, TitleService, ALAIN_I18N_TOKEN } from '@delon/theme';
import { DA_SERVICE_TOKEN, ITokenService } from '@delon/auth';
import { ACLService } from '@delon/acl';

/**
 * 用于应用启动时
 * 一般用来获取应用所需要的基础数据等
 */
@Injectable()
export class StartupService {
  constructor(
    private menuService: MenuService,
    private settingService: SettingsService,
    private aclService: ACLService,
    private titleService: TitleService,
    @Inject(DA_SERVICE_TOKEN) private tokenService: ITokenService,
    private httpClient: HttpClient,
    private injector: Injector
  ) { }

  private viaHttp(resolve: any, reject: any) {
    zip(
      this.httpClient.get('assets/tmp/app-data.json')
    ).pipe(
      // 接收其他拦截器后产生的异常消息
      catchError(([appData]) => {
          resolve(null);
          return [appData];
      })
    ).subscribe(([appData]) => {

      // application data
      const res: any = appData;
      // 应用信息：包括站点名、描述、年份
      this.settingService.setApp(res.app);
      // 用户信息：包括姓名、头像、邮箱地址
      this.settingService.setUser(res.user);
      // ACL：设置权限为全量
      this.aclService.setFull(true);
      // 初始化菜单
      this.menuService.add(res.menu);
      // 设置页面标题的后缀
      this.titleService.suffix = res.app.name;
    },
    () => { },
    () => {
      resolve(null);
    });
  }

  private viaMock(resolve: any, reject: any) {
    // const tokenData = this.tokenService.get();
    // if (!tokenData.token) {
    //   this.injector.get(Router).navigateByUrl('/passport/login');
    //   resolve({});
    //   return;
    // }
    // mock
    const app: any = {
      name: `云账房`,
      description: `一键报税，高效专业的互联网代账平台！`
    };
    const user: any = {
      name: 'Admin',
      avatar: './assets/tmp/img/avatar.jpg',
      email: 'cipchk@qq.com',
      token: '123456789'
    };
    // 应用信息：包括站点名、描述、年份
    this.settingService.setApp(app);
    // 用户信息：包括姓名、头像、邮箱地址
    this.settingService.setUser(user);
    // ACL：设置权限为全量
    this.aclService.setFull(true);
    // 初始化菜单
    this.menuService.add([
          {
            text:'首页',
            icon:'anticon anticon-home'
          },
          {
            text: '基础设置',
            icon: 'anticon anticon-appstore-o',
            children: [
              {
                text: '平台指标管理',
                link: '/dashboard'
              },
              {
                text: '企业指标管理',
                link: '/sys/log'
              }
            ]
          },
          {
            text: '风险预警',
            icon: 'anticon anticon-appstore-o',
            children: [
              {
                text: '已触发预警',
                link: '/dashboard'
              },
              {
                text: '风险预警',
                link: '/sys/log'
              }
            ]
          },
          {
            text: '报表分析',
            icon: 'anticon anticon-appstore-o',
            children: [
              {
                text: '经营状况表',
                link: '/dashboard'
              },
              {
                text: '应收账款统计表',
                link: '/sys/log'
              },
              {
                text: '账龄分析',
                link: '/sys/log'
              },
              {
                text: '费用统计',
                link: '/sys/log'
              }
            ]
          },
          {
            text: '财税体检',
            icon: 'anticon anticon-appstore-o',
            children: [
              {
                text: '财税体检',
                link: '/dashboard'
              }
            ]
          }
        ]);
    // 设置页面标题的后缀
    this.titleService.suffix = app.name;

    resolve({});
  }

  load(): Promise<any> {
    // only works with promises
    // https://github.com/angular/angular/issues/15088
    return new Promise((resolve, reject) => {
      // http
      this.viaHttp(resolve, reject);
      // mock：请勿在生产环境中这么使用，viaMock 单纯只是为了模拟一些数据使脚手架一开始能正常运行
      // this.viaMock(resolve, reject);
    });
  }
}
