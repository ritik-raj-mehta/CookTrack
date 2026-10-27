import React, { useState } from "react";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, Layout, Menu, theme } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import { FaCartPlus, FaHome } from "react-icons/fa";
import { FiCodesandbox } from "react-icons/fi";
import { IoMdAdd } from "react-icons/io";
import { FaPeopleGroup } from "react-icons/fa6";
import { LuChefHat } from "react-icons/lu";

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
        boxShadow: "1px 0 12px 0 rgba(0, 0, 0, 0.04)",
        zIndex: 20,
        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
      trigger={null}
      collapsible
      collapsed={collapsed}
      width={230}
      collapsedWidth={80}
    >
      <div className="flex flex-col h-full justify-between">
        <div>
          {/* Top Header Row with Logo & Collapse Button */}
          <div
            className={`flex items-center ${
              collapsed ? "justify-center" : "justify-between"
            } px-4 py-4 border-b border-gray-100 min-h-[68px] transition-all`}
          >
            {!collapsed ? (
              <div className="flex items-center space-x-2.5 truncate">
                <div className="bg-gradient-to-tr from-green-600 to-emerald-400 text-white p-2 rounded-xl text-xl shadow-xs">
                  <LuChefHat />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-bold font-serif text-gray-900 tracking-tight truncate flex items-center">
                    CookTrack
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 ml-1"></span>
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                    Kitchen System
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-gradient-to-tr from-green-600 to-emerald-400 text-white p-2 rounded-xl text-xl shadow-xs">
                <LuChefHat />
              </div>
            )}

            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className="text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              style={{ fontSize: "16px" }}
              title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            />
          </div>

          {/* Navigation Menu */}
          <div className="py-3">
            <Menu
              style={{
                fontSize: "14px",
                fontWeight: 500,
                borderRight: 0,
              }}
              theme="light"
              mode="inline"
              selectedKeys={[selectedKey]}
              items={[
                {
                  key: "1",
                  icon: <FaHome className="text-lg text-emerald-600" />,
                  label: <NavLink to="/dashboard">Dashboard</NavLink>,
                },
                {
                  key: "2",
                  icon: <FiCodesandbox className="text-lg text-amber-600" />,
                  label: <NavLink to="/kitchenitems">My Items</NavLink>,
                },
                {
                  key: "3",
                  icon: <IoMdAdd className="text-lg text-green-600" />,
                  label: <NavLink to="/additemstokitchen">Add Items</NavLink>,
                },
                {
                  key: "4",
                  icon: <FaCartPlus className="text-lg text-blue-600" />,
                  label: <NavLink to="/additemstoshoppingcart">Shopping List</NavLink>,
                },
                {
                  key: "5",
                  icon: <FaPeopleGroup className="text-lg text-indigo-600" />,
                  label: <NavLink to="/kitchenmembers">Members</NavLink>,
                },
              ]}
            />
          </div>
        </div>

        {/* Bottom subtle status badge */}
        {!collapsed && (
          <div className="p-4 border-t border-gray-100">
            <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 flex items-center gap-2.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <div className="text-xs">
                <p className="font-semibold text-emerald-900">Inventory Live</p>
                <p className="text-[10px] text-emerald-700/80">Cloud Sync Active</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Sider>
  );
};

export default NavBar;
