import { parse } from 'url';

let userList = [];
for (let i = 0; i < 46; i += 1) {
  userList.push({
    id: i,
    username: `张三 ${i}`,
    password: null,
    phone: '1388888888' + (i % 10),
    email: 'zs' + i + '@123.com',
    status: i % 2,
    created: new Date(`2019-03-${Math.floor(i / 2) + 1}`),
    updated: new Date(`2019-03-${Math.floor(i / 2) + 1}`),
  });
}

function getUser(req, res, u) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }
  const params = parse(url, true).query;

  let dataSource = userList;

  if (params.sorter) {
    const s = params.sorter.split('_');
    dataSource = dataSource.sort((prev, next) => {
      if (s[1] === 'descend') {
        return next[s[0]] - prev[s[0]];
      }
      return prev[s[0]] - next[s[0]];
    });
  }

  if (params.status) {
    const status = params.status.split(',');
    let filterDataSource = [];
    status.forEach(s => {
      filterDataSource = filterDataSource.concat(
        dataSource.filter(data => parseInt(data.status, 10) === parseInt(s[0], 10))
      );
    });
    dataSource = filterDataSource;
  }

  if (params.username) {
    dataSource = dataSource.filter(data => data.username.indexOf(params.username) > -1);
  }

  if (params.phone) {
    dataSource = dataSource.filter(data => data.phone.indexOf(params.phone) > -1);
  }

  if (params.email) {
    dataSource = dataSource.filter(data => data.email.indexOf(params.email) > -1);
  }

  if (params.createdSt && params.createdEd) {
    dataSource = dataSource.filter(
      data => data.created >= params.createdSt && data.created <= params.createdEd
    );
  }

  let pageSize = 10;
  if (params.pageSize) {
    pageSize = params.pageSize * 1;
  }

  const result = {
    list: dataSource,
    pagination: {
      total: dataSource.length,
      pageSize,
      current: parseInt(params.currentPage, 10) || 1,
    },
  };

  return res.json(result);
}

function postUser(req, res, u, b) {
  let url = u;
  if (!url || Object.prototype.toString.call(url) !== '[object String]') {
    url = req.url; // eslint-disable-line
  }

  const body = (b && b.body) || req.body;
  const { method, id, username, phone, email, status } = body;

  switch (method) {
    /* eslint no-case-declarations:0 */
    case 'delete':
      tableListDataSource = tableListDataSource.filter(item => key.indexOf(item.key) === -1);
      break;
    case 'post':
      const i = Math.ceil(Math.random() * 10000);
      userList.unshift({
        id: i,
        username: username,
        password: null,
        phone: phone,
        email: email,
        status: status,
        created: new Date(),
        updated: new Date(),
      });
      break;
    case 'update':
      userList = userList.map(item => {
        if (item.id === id) {
          Object.assign(item, { username, phone, email, status });
          return item;
        }
        return item;
      });
      break;
    default:
      break;
  }

  return getUser(req, res, u);
}

export default {
  'GET /api/user': getUser,
  'POST /api/user': postUser,
};
