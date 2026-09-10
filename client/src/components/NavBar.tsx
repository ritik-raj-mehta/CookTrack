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



const { Header, Sider } = Layout;

const NavBar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(true);
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

    // "/admin" : "6",
    // "/admin/adddoctor" : "7"
  };

  const selectedKey = pathToKey[location.pathname] || "1";


  return (
    <div className="">
      <Layout>
        <Sider
          style={{ fontSize: "30px", width: 64, height: 64, background: colorBgContainer, }}
          trigger={null} collapsible collapsed={collapsed}>
          <h1 className=" text-yellow-400 mx-auto font-bold text-center text-3xl pt-5 w-fit">Cook Track</h1>
          <div className="demo-logo-vertical" />

          <Menu

            style={{ fontSize: "20px", paddingTop: "30px", }}
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={[
              {
                key: "1",
                icon: <FaHome />,
                label: <NavLink to="/dashboard">DashBoard</NavLink>,
              },
              {
                key: "2",
                icon: <FiCodesandbox />,
                label: <NavLink to="/kitchenitems">My Items</NavLink>,
              },
              {
                key: "3",
                icon: <IoMdAdd />,
                label: <NavLink to="/additemstokitchen">Add Items</NavLink>,
              },
              {
                key: "4",
                icon: <FaCartPlus />,
                label: <NavLink to="/additemstoshoppingcart">Shopping Cart</NavLink>,
              },
              {
                key: "5",
                icon: <FaPeopleGroup />,
                label: <NavLink to="/kitchenmembers">Members</NavLink>,
              },

              // {
              //   key: "5",
              //   icon: <MdContactPage />,
              //   label: <NavLink to="/admin/contactmessage">Messages</NavLink>,
              // },
              // {
              //   key: "7",
              //   icon: <HiOutlineUserAdd />,
              //   label: <NavLink to="/admin/adddoctor">Add Docotor</NavLink>,
              // },
            ]}

          />


        </Sider>

        <Layout>
          <Header style={{ padding: 0, background: colorBgContainer }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: "20px", width: 64, height: 64, display: "relative" }}
            />

          </Header>
          {/* <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          Content
        </Content> */}
        </Layout>
      </Layout>
    </div>

  );
};

export default NavBar;

