import React, { useState, useEffect, useContext } from 'react';
import { UsersContext } from '../../contexts/UsersContext';
import { Table, Input, Button, Space, Pagination, Spin, message, Avatar, Typography, Popconfirm, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined, UserOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/es/table';
import { getUsers, deleteUser } from '../../services/UserService';
import { IUser } from '../../types/UserTypes';
import UserForm from '../UserForm/UserForm';
import styles from './UserList.module.css';

const UserList: React.FC = () => {
  const context = useContext(UsersContext);
  if (!context) {
    throw new Error('useUsers debe estar dentro del proveedor UsersProvider');
  }

  const {
    users, loading, error, totalUsers, currentPage, pageSize, fetchUsers, setCurrentPage,
    setPageSize, setSearchText, setLoading, setUsers, setTotalUsers, setAllUsers, setError
  } = context;

  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUser | null>(null);

  const toggleDrawer = (visible: boolean) => setIsDrawerVisible(visible);

  const reloadUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers(currentPage, pageSize);
      setUsers(response.data);
      setTotalUsers(response.total);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Ocurrió un error al cargar los usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    getUsers(currentPage, pageSize)
      .then((response) => {
        setUsers(response.data);
        setAllUsers(response.data);
        setTotalUsers(response.total);
      })
      .catch((error) => {
        setError(error instanceof Error ? error.message : 'Ocurrió un error inesperado');
      })
      .finally(() => setLoading(false));
  }, [currentPage, pageSize]);

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      message.success('Usuario eliminado exitosamente');

      const remainingUsers = users.length - 1;
      if (remainingUsers % pageSize === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        fetchUsers();
      }
    } catch (error) {
      message.error(
        `Error al eliminar el usuario: ${
          error instanceof Error ? error.message : 'Error desconocido'
        }`
      );
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value.toLowerCase());
    setLoading(true);
    getUsers(1, pageSize, value)
      .then((response) => {
        setUsers(response.data);
        setTotalUsers(response.total);
      })
      .catch((error) => setError(error.message))
      .finally(() => setLoading(false));
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setCurrentPage(page);
    setPageSize(pageSize);
  };

  const handleUserClick = (user: IUser) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const columns: ColumnType<IUser>[] = [
    {
      title: <span className={styles.headerTitle}>Nombre</span>,
      key: 'name',
      render: (_, record: IUser) => (
        <Space onClick={() => handleUserClick(record)} style={{ cursor: 'pointer' }}>
          <Avatar src={record.photo} alt={record.name} icon={<UserOutlined />} />
          <span className={styles.name}>{record.name}</span>
        </Space>
      ),
    },
    {
      title: <span className={styles.headerTitle}>Descripción</span>,
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: <span className={styles.headerTitle}>Acciones</span>,
      key: 'actions',
      align: 'center',
      render: (_, record: IUser) => (
        <Popconfirm
          title="¿Estás seguro de eliminar este usuario?"
          onConfirm={() => handleDelete(record.id)}
          okText="Sí"
          cancelText="No"
        >
          <DeleteOutlined />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Typography.Title level={1}>Agenda Previred - Mi agenda de contactos laboral</Typography.Title>
        <Typography.Paragraph>
          Aquí podrá encontrar o buscar a todos sus contactos agregados, agregar nuevos contactos y eliminar contactos no deseados.
        </Typography.Paragraph>
        <div style={{ marginBottom: 16 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => toggleDrawer(true)}>
            Agregar Contacto
          </Button>
        </div>
        <Input.Search
          placeholder="Buscar contacto"
          onSearch={handleSearch}
          className={styles.search}
        />
      </div>

      {error && <p>Error: {error}</p>}

      <div className={styles.spinContainer}>
        {loading ? (
          <Spin size="large" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} />
        ) : (
          <>
            <Table
              columns={columns}
              dataSource={users}
              rowKey="id"
              pagination={false}
            />
            <Pagination
              current={currentPage}
              pageSize={pageSize}
              total={totalUsers}
              onChange={handlePageChange}
              onShowSizeChange={handlePageChange}
              className={styles.pagination}
            />
          </>
        )}
      </div>

      <UserForm
        visible={isDrawerVisible}
        onClose={() => toggleDrawer(false)}
        onUserCreated={reloadUsers}
      />

      <Modal
        title=""
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={500}
      >
        {selectedUser && (
          <div style={{ textAlign: 'center' }}>
            <Avatar src={selectedUser.photo} alt={selectedUser.name} size={64} icon={<UserOutlined />} style={{ marginBottom: 16 }} />
            <Typography.Title level={4}>{selectedUser.name}</Typography.Title>
            <Typography.Paragraph>{selectedUser.description}</Typography.Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserList;
