import React from 'react';
import { Drawer, Form, Input, Button, message, Space } from 'antd';
import { createUser } from '../../services/UserService';
import { IUser } from '../../types/UserTypes';
import styles from './UserForm.module.css';

interface UserFormProps {
  visible: boolean;
  onClose: () => void;
  onUserCreated: () => void;
}

const UserForm: React.FC<UserFormProps> = ({ visible, onClose, onUserCreated }) => {
  const [form] = Form.useForm();

  const validateImageUrl = (_: any, value: string) => {
    if (!value) return Promise.resolve();
    const pattern = /^(https?:\/\/)([a-zA-Z0-9.-]+)(\/[a-zA-Z0-9._%+-]*)*(\.(jpg|jpeg|png|gif|bmp|svg|webp))$/i;
    return pattern.test(value)
      ? Promise.resolve()
      : Promise.reject(new Error('La URL debe ser válida y apuntar a una imagen (jpg, jpeg, png, gif, bmp, svg, webp)'));
  };

  const onSubmit = async (values: IUser) => {
    try {
      await createUser(values);
      message.success('Usuario agregado exitosamente');
      form.resetFields();
      onClose();
      onUserCreated();
    } catch (error: any) {
      const errorMsg = error?.message || 'Hubo un error al agregar el usuario';
      message.error(errorMsg);
    }
  };

  const renderFormItem = (name: string, label: string, placeholder: string, rules: any[] = []) => (
    <Form.Item name={name} label={<span className={styles.boldLabel}>{label}</span>} rules={rules}>
      <Input placeholder={placeholder} />
    </Form.Item>
  );

  const drawerActions = (
    <Space>
      <Button onClick={() => { form.resetFields(); onClose(); }}>Cancelar</Button>
      <Button type="primary" onClick={() => form.submit()}>Guardar</Button>
    </Space>
  );

  return (
    <Drawer
      title={<span className={styles.drawerTitle}>Agregar Nuevo Contacto</span>}
      width={620}
      open={visible}
      onClose={() => { form.resetFields(); onClose(); }}
      extra={drawerActions}
    >
      <Form form={form} layout="vertical" onFinish={onSubmit}>
        {renderFormItem('photo', 'URL imagen de Perfil', 'Ingrese la URL de la imagen de perfil', [
          { required: true, message: 'Por favor ingrese una URL de imagen' },
          { validator: validateImageUrl },
        ])}

        {renderFormItem('name', 'Nombre', 'Escriba el nombre de contacto', [
          { required: true, message: 'Por favor ingrese el nombre del contacto' },
        ])}

        {renderFormItem('description', 'Descripción', 'Agregue la descripción del contacto', [
          { required: true, message: 'Por favor ingrese una descripción' },
        ])}
      </Form>
    </Drawer>
  );
};

export default UserForm;
