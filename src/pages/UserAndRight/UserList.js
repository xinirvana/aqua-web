import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import moment from 'moment';
import router from 'umi/router';
import { formatMessage, FormattedMessage } from 'umi/locale';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  DatePicker,
  Modal,
  message,
  Badge,
  Divider,
  Popconfirm,
  Transfer,
} from 'antd';
import StandardTable from '@/components/StandardTable';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

import styles from './UserList.less';

const FormItem = Form.Item;
const { TextArea } = Input;
const { Option } = Select;
const { RangePicker } = DatePicker;
const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');
const statusMap = ['default', 'success'];
const status = ['禁用', '正常'];

/**
 * 用户列表
 * 使用dva，调用model的effects
 */
/* eslint react/no-multi-comp:0 */
@connect(({ userright, loading }) => ({
  userright,
  loading: loading.models.userright,
}))
@Form.create()
class UserList extends PureComponent {
  state = {
    modalVisible: false,
    updateModalVisible: false,
    expandForm: false,
    selectedRows: [],
    formValues: {}, // 查询条件
    updateFormValues: {},
    roleSetModalVisible: false,
    roleData: [],
    targetRoleIds: [],
    disabled: true,
  };

  columns = [
    {
      title: '序号',
      dataIndex: 'no',
      render: (text, record, index) => <span>{index + 1}</span>,
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '手机号码',
      dataIndex: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: true,
    },
    {
      title: '创建日期',
      dataIndex: 'created',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '修改日期',
      dataIndex: 'updated',
      sorter: true,
      render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      filters: [
        {
          text: status[0],
          value: 0,
        },
        {
          text: status[1],
          value: 1,
        },
      ],
      render(val) {
        return <Badge status={statusMap[val]} text={status[val]} />;
      },
    },
    {
      title: '操作',
      render: (text, record) => (
        <Fragment>
          <a onClick={() => this.handleUpdateModalVisible(true, record)}>编辑</a>
          <Divider type="vertical" />
          <a onClick={() => this.handleRoleSetModalVisible(true, record)}>指定角色</a>
        </Fragment>
      ),
    },
  ];

  // 生命周期方法：组件渲染完成
  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'userright/fetch',
    });
    dispatch({
      type: 'userright/fetchRole',
      callback: (res) => {
        if (res) {
          this.setState({roleData: res});
        } else {
          message.error('获取角色失败');
        }
      },
    });
  }

  // Table onChange事件：分页、筛选、排序处理
  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'userright/fetch',
      payload: params,
    });
  };

  // 重置查询条件
  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'userright/fetch',
      payload: {},
    });
  };

  // 展开收起扩展查看条件表单
  toggleForm = () => {
    const { expandForm } = this.state;
    this.setState({
      expandForm: !expandForm,
    });
  };

  // 重置密码事件处理
  handleResetPwd = () => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    
    if (selectedRows.length === 0) return;
    dispatch({
      type: 'userright/resetPwd',
      payload: {
        ids: selectedRows.map(row => row.id),
      },
      callback: (res) => {
        if (res && res.success) {
          message.success('重置密码成功');
          this.tableReload();
        } else {
          message.error('重置密码失败');
        }
      },
    });
  };

  // 更多操作菜单点击事件处理
  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (selectedRows.length === 0) return;
    switch (e.key) {
      case 'disable':
        dispatch({
          type: 'userright/disable',
          payload: {
            ids: selectedRows.map(row => row.id),
          },
          callback: (res) => {
            if (res && res.success) {
              message.success('禁用成功');
              this.tableReload();
            } else {
              message.error('禁用失败');
            }
          },
        });
        break;
      case 'remove':
        dispatch({
          type: 'userright/remove',
          payload: {
            ids: selectedRows.map(row => row.id),
          },
          callback: (res) => {
            if (res && res.success) {
              message.success('删除成功');
              this.setState({
                selectedRows: [],
              });
              this.tableReload();
            } else {
              message.error('删除失败');
            }
          },
        });
        break;
      default:
        break;
    }
  };

  // 行选择事件处理
  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  // 查询事件处理
  handleSearch = e => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        // 按天选择的日期，设置一下时分秒，准确比较大小
        createdSt:
          fieldsValue.created &&
          fieldsValue.created[0] &&
          fieldsValue.created[0].set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).valueOf(),
        createdEd:
          fieldsValue.created &&
          fieldsValue.created[1] &&
          fieldsValue.created[1]
            .set({ hour: 23, minute: 59, second: 59, millisecond: 999 })
            .valueOf(),
      };
      // 日期控件获取的值是一个moment对象，GET时会出错，需处理
      if (values.created) delete values.created;

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'userright/fetch',
        payload: values,
      });
    });
  };

  // 显示新建Modal对话框
  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  // 显示修改Modal对话框
  handleUpdateModalVisible = (flag, record) => {
    this.setState({
      updateModalVisible: !!flag,
      updateFormValues: record || {},
    });
  };

  // 显示角色指定Modal对话框
  handleRoleSetModalVisible = (flag, record) => {
    this.setState({
      roleSetModalVisible: !!flag,
      //updateFormValues: record || {},
    });

    this.setState({disabled: true});
    const { dispatch } = this.props;

    dispatch({
      type: 'userright/fetchUserRole',
      payload: {
        userId: 6,
      },
      callback: (res) => {
        if (res) {
          this.setState({targetRoleIds: res});
        } else {
          this.setState({targetRoleIds: []});
        }
        this.setState({disabled: false});
      },
    });
  };

  // 新增确认处理
  handleAdd = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userright/add',
      payload: fields,
      callback: (res) => {
        if (res && res.success) {
          message.success('添加成功');
          this.tableReload();
        } else {
          message.error('添加失败');
        }
      },
    });
    this.handleModalVisible();
  };

  // 修改确认处理
  handleUpdate = fields => {
    const { dispatch } = this.props;
    dispatch({
      type: 'userright/update',
      payload: fields,
      callback: (res) => {
        if (res && res.success) {
          message.success('修改成功');
          this.tableReload();
        } else {
          message.error('修改失败');
        }
      },
    });
    this.handleUpdateModalVisible();
  };

  // 重新查询
  tableReload = () => {
    const { dispatch } = this.props;
    const { formValues } = this.state;
    dispatch({
      type: 'userright/fetch',
      payload: formValues,
    });
  };

  // 选项来回转移事件处理
  handleChange = (nextTargetKeys, direction, moveKeys) => {
    this.setState({ targetRoleIds: nextTargetKeys });
    // console.log('targetKeys: ', nextTargetKeys);
    // console.log('direction: ', direction);
    // console.log('moveKeys: ', moveKeys);
  }

  // 查询条件表单 - 简单
  renderSimpleForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名">
              {getFieldDecorator('username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">禁用</Option>
                  <Option value="1">正常</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  // 查询条件表单 - 扩展
  renderAdvancedForm() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="用户名">
              {getFieldDecorator('username')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">禁用</Option>
                  <Option value="1">正常</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24} />
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="手机号码">
              {getFieldDecorator('phone')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="Email">
              {getFieldDecorator('email')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label={<FormattedMessage id="userright.date.label.created" />}>
              {getFieldDecorator('created')(
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={[
                    formatMessage({ id: 'userright.date.placeholder.start' }),
                    formatMessage({ id: 'userright.date.placeholder.end' }),
                  ]}
                />
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <div style={{ marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </div>
        </div>
      </Form>
    );
  }

  // 展开/收起 扩展查询条件表单
  renderForm() {
    const { expandForm } = this.state;
    return expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  // 查询列表 默认渲染
  render() {
    const {
      userright: { data },
      loading,
    } = this.props;
    const { selectedRows, modalVisible, updateModalVisible, updateFormValues, 
      roleSetModalVisible, roleData, targetRoleIds, disabled } = this.state;
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="disable">禁用</Menu.Item>
        <Menu.Item key="remove" disabled="true">删除</Menu.Item>
      </Menu>
    );

    const addMethods = {
      handleModalVisible: this.handleModalVisible,
      handleAdd: this.handleAdd,
    };
    const updateMethods = {
      handleUpdateModalVisible: this.handleUpdateModalVisible,
      handleUpdate: this.handleUpdate,
    };
    const roleSetMethods = {
      handleRoleSetModalVisible: this.handleRoleSetModalVisible,
      handleChange: this.handleChange,
    };
    return (
      <PageHeaderWrapper title="用户管理">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {selectedRows.length > 0 && (
                <span>
                  <Popconfirm placement="rightBottom" title="确认重置密码？（888888）" onConfirm={this.handleResetPwd} okText="确认" cancelText="取消">
                    <Button>重置密码</Button>
                  </Popconfirm>
                  <Dropdown overlay={menu}>
                    <Button>
                      更多操作 <Icon type="down" />
                    </Button>
                  </Dropdown>
                </span>
              )}
            </div>
            <StandardTable
              rowKey={record => record.id}
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={this.columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <CreateForm {...addMethods} modalVisible={modalVisible} />
        {updateFormValues && Object.keys(updateFormValues).length ? (
          <UpdateForm
            {...updateMethods}
            updateModalVisible={updateModalVisible}
            values={updateFormValues}
          />
        ) : null}
        <RoleSetForm 
          {...roleSetMethods}
          roleSetModalVisible={roleSetModalVisible}
          roleData={roleData}
          targetRoleIds={targetRoleIds}
          disabled={disabled}
        />
      </PageHeaderWrapper>
    );
  }
}

// 新建用户Modal
const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible } = props;
  const prefixSelector = form.getFieldDecorator('prefix', {
    initialValue: '86',
  })(
    <Select style={{ width: 70 }}>
      <Option value="86">+86</Option>
      <Option value="852">+852</Option>
    </Select>
  );
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) return;
      form.resetFields();
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      destroyOnClose
      title="新建用户"
      visible={modalVisible}
      onOk={okHandle}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="用户名">
        {form.getFieldDecorator('username', {
          rules: [{ required: true, message: '请输入至少两个字符的用户名！', min: 2 }],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="手机号">
        {form.getFieldDecorator('phone', {
          rules: [{ required: true, message: '请输入手机号！', min: 8 }],
        })(<Input addonBefore={prefixSelector} placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="Email">
        {form.getFieldDecorator('email', {
          rules: [
            {
              type: 'email',
              message: '请正确输入Email！',
            },
            {
              required: true,
              message: '请输入Email！',
            },
          ],
        })(<Input placeholder="请输入" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="状态">
        {form.getFieldDecorator('status', {
          initialValue: '1', //设置默认值
        })(
          <Select placeholder="请选择" style={{ width: '100%' }}>
            <Option value="1">正常</Option>
            <Option value="0">禁用</Option>
          </Select>
        )}
      </FormItem>
    </Modal>
  );
});

// 修改用户Modal
@Form.create()
class UpdateForm extends PureComponent {
  static defaultProps = {
    handleUpdate: () => {},
    handleUpdateModalVisible: () => {},
    values: {},
  };

  constructor(props) {
    super(props);

    this.formLayout = {
      labelCol: { span: 7 },
      wrapperCol: { span: 15 },
    };
  }

  render = () => {
    const { updateModalVisible, form, handleUpdate, handleUpdateModalVisible, values } = this.props;
    const prefixSelector = form.getFieldDecorator('prefix', {
      initialValue: '86',
    })(
      <Select style={{ width: 70 }}>
        <Option value="86">+86</Option>
        <Option value="852">+852</Option>
      </Select>
    );
    const okHandle = () => {
      form.validateFields((err, fieldsValue) => {
        if (err) return;
        form.resetFields();
        handleUpdate(fieldsValue);
      });
    };
    return [
      <Modal
        key={values.id}
        destroyOnClose
        title="编辑用户"
        visible={updateModalVisible}
        onOk={okHandle}
        onCancel={() => handleUpdateModalVisible(false, values)}
        afterClose={() => handleUpdateModalVisible()}
      >
        {form.getFieldDecorator('id', { initialValue: values.id })(<Input type="hidden" />)}
        <FormItem {...this.formLayout} label="用户名">
          {form.getFieldDecorator('username', {
            rules: [{ required: true, message: '请输入至少两个字符的用户名！', min: 2 }],
            initialValue: values.username,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="手机号">
          {form.getFieldDecorator('phone', {
            rules: [{ required: true, message: '请输入手机号！', min: 8 }],
            initialValue: values.phone,
          })(<Input addonBefore={prefixSelector} placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="Email">
          {form.getFieldDecorator('email', {
            rules: [
              {
                type: 'email',
                message: '请正确输入Email！',
              },
              {
                required: true,
                message: '请输入Email！',
              },
            ],
            initialValue: values.email,
          })(<Input placeholder="请输入" />)}
        </FormItem>
        <FormItem {...this.formLayout} label="状态">
          {form.getFieldDecorator('status', {
            initialValue: values.status + '',
          })(
            <Select placeholder="请选择" style={{ width: '100%' }}>
              <Option value="1">正常</Option>
              <Option value="0">禁用</Option>
            </Select>
          )}
        </FormItem>
      </Modal>,
    ];
  };
}

// 指定角色Modal
const RoleSetForm = Form.create()(props => {
  const { 
    roleData, targetRoleIds,
    roleSetModalVisible, handleRoleSet, handleRoleSetModalVisible, handleChange, disabled } = props;
  const okHandle = () => {
    // form.validateFields((err, fieldsValue) => {
    //   if (err) return;
    //   form.resetFields();
    //   handleRoleSet(fieldsValue);
    // });
  };
  return (
    <Modal
      destroyOnClose
      title="指定角色"
      visible={roleSetModalVisible}
      onOk={okHandle}
      onCancel={() => handleRoleSetModalVisible()}
    >
      <div>
        <Transfer
          rowKey={record => record.id}
          dataSource={roleData}
          titles={['可指定角色', '已指定角色']}
          targetKeys={targetRoleIds}
          onChange={handleChange}
          render={item => item.name}
          showSearch
          listStyle={{ width: 210, height: 300, }}
          disabled={disabled}
        />
      </div>
    </Modal>
  );
});

export default UserList;
