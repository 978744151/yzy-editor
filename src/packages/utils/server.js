/**
 * 虚拟服务端-路由器
 */
export class Router {
  constructor() {
    this.routes = []
  }
  parseUrl(url) {
    const pos = url.indexOf('?')
    const path = pos > 0 ? url.slice(0, pos) : url
    const queryString = url.slice(pos)
    return {
      path,
      query: queryString,
    }
  }
  route(path, handler) {
    this.routes.push({
      regex: new RegExp(
        path
          .split('/')
          .map((item) => (item[0] === ':' ? `(?<${item.slice(1)}>\\S+)` : item))
          .join('/')
      ),
      handler,
    })
  }
  match(cfg) {
    const { url } = cfg
    const { path } = this.parseUrl(url)
    for (let i = 0; i < this.routes.length; i++) {
      const result = path.match(this.routes[i].regex)
      if (result) {
        return this.routes[i].handler({ ...cfg, path, params: result.groups })
      }
    }
  }
}
