import React, { useState } from "react";
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import { FaCartPlus, FaHome } from "react-icons/fa";
import { FiCodesandbox } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { FaPeopleGroup } from "react-icons/fa6";



const { Sider } = Layout;

const NavBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  const location = useLocation();

  const pathToKey: Record<string, string> = {
    "/dashboard": "1",
    "/kitchenitems": "2",
    "/additemstokitchen": "3",
    "/additemstoshoppingcart": "4",
    "/kitchenmembers": "5",
  };

  const selectedKey = pathToKey[location.pathname] || "1";

  return (
    <Sider
      style={{
        background: colorBgContainer,
        minHeight: "100vh",
        boxShadow: "2px 0 8px 0 rgba(0, 0, 0, 0.05)",
        zIndex: 10,
      }}
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={220}
      collapsedWidth={80}
    >
      <div
        className={`flex items-center ${
          collapsed ? "justify-center" : "justify-between"
        } px-4 py-4 border-b border-gray-100 min-h-[64px]`}
      >
        {!collapsed && (
          <span className="text-amber-700 font-bold text-xl font-serif tracking-tight truncate">
            Cook Track
          </span>
        )}
        <Button
          type="text"
          icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-600 hover:text-black"
          style={{ fontSize: "18px" }}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        />
      </div>

      <Menu
        style={{ fontSize: "15px", paddingTop: "12px", borderRight: 0 }}
        theme="light"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={[
          {
            key: "1",
            icon: <FaHome className="text-lg" />,
            label: <NavLink to="/dashboard">Dashboard</NavLink>,
          },
          {
            key: "2",
            icon: <FiCodesandbox className="text-lg" />,
            label: <NavLink to="/kitchenitems">My Items</NavLink>,
          },
          {
            key: "3",
            icon: <IoMdAdd className="text-lg" />,
            label: <NavLink to="/additemstokitchen">Add Items</NavLink>,
          },
          {
            key: "4",
            icon: <FaCartPlus className="text-lg" />,
            label: <NavLink to="/additemstoshoppingcart">Shopping List</NavLink>,
          },
          {
            key: "5",
            icon: <FaPeopleGroup className="text-lg" />,
            label: <NavLink to="/kitchenmembers">Members</NavLink>,
          },
        ]}
      />
    </Sider>
  );
};

export default NavBar;

