import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  changeAdminUserRole,
  createAdminUser,
  deleteAdminUser,
  getAdminDashboard,
  getAdminUsers,
  lockAdminUser,
  unlockAdminUser,
} from "../../store/api";
import "./AdminDashboard.css";

const roleOptions = [
  { value: "admin", label: "Admin" },
  { value: "student", label: "Sinh viên" },
  { value: "teacher", label: "Giảng viên" },
  { value: "hr", label: "Nhân sự" },
  { value: "ht", label: "Hiệu trưởng" },
  { value: "tbm", label: "Trưởng bộ môn" },
  { value: "pdt", label: "Phòng đào tạo" },
];

const initialForm = {
  displayName: "",
  username: "",
  email: "",
  password: "",
  role: "student",
};

const sectionConfig = {
  overview: {
    eyebrow: "Quản trị hệ thống",
    title: "Dashboard Admin",
    subtitle: "Theo dõi tài khoản, phân quyền và trạng thái người dùng trong LMS.",
  },
  users: {
    eyebrow: "Quản lý tài khoản",
    title: "Danh sách người dùng",
    subtitle: "Tìm kiếm, lọc, khóa tài khoản và thay đổi vai trò người dùng.",
  },
  create: {
    eyebrow: "Tạo tài khoản",
    title: "Thêm người dùng mới",
    subtitle: "Tạo nhanh tài khoản cho sinh viên, giảng viên và nhân sự.",
  },
  roles: {
    eyebrow: "Phân quyền",
    title: "Phân bổ vai trò",
    subtitle: "Xem số lượng tài khoản theo từng nhóm quyền trong hệ thống.",
  },
};

const getUserId = (user) => user._id || user.id;

const getSectionFromHash = (hash) => {
  if (hash === "#users") {
    return "users";
  }

  if (hash === "#create-user") {
    return "create";
  }

  if (hash === "#roles") {
    return "roles";
  }

  return "overview";
};

const formatDate = (value) => {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(value));
};

export default function AdminDashboard() {
  const location = useLocation();
  const activeSection = getSectionFromHash(location.hash);
  const activeContent = sectionConfig[activeSection];

  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [actionId, setActionId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const fetchAdminData = async () => {
    const [dashboardResponse, usersResponse] = await Promise.all([
      getAdminDashboard(),
      getAdminUsers(),
    ]);

    return {
      dashboard: dashboardResponse.data,
      users: usersResponse.data || [],
    };
  };

  const loadAdminData = async () => {
    setLoading(true);
    setError("");

    try {
      const nextData = await fetchAdminData();
      setDashboard(nextData.dashboard);
      setUsers(nextData.users);
    } catch (err) {
      setError(err.message || "Không tải được dữ liệu admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;

    const initializeAdminData = async () => {
      try {
        const nextData = await fetchAdminData();

        if (ignore) {
          return;
        }

        setDashboard(nextData.dashboard);
        setUsers(nextData.users);
      } catch (err) {
        if (!ignore) {
          setError(err.message || "Không tải được dữ liệu admin");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    initializeAdminData();

    return () => {
      ignore = true;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return users.filter((user) => {
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      const searchable = [
        user.displayName,
        user.username,
        user.email,
        user.role,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return matchesRole && searchable.includes(normalizedSearch);
    });
  }, [roleFilter, searchTerm, users]);

  const stats = [
    {
      label: "Tổng tài khoản",
      value: dashboard?.totalUsers ?? 0,
      tone: "blue",
    },
    {
      label: "Đang hoạt động",
      value: dashboard?.activeUsers ?? 0,
      tone: "sky",
    },
    {
      label: "Đang khóa",
      value: dashboard?.lockedUsers ?? 0,
      tone: "indigo",
    },
    {
      label: "Đã xóa",
      value: dashboard?.deletedUsers ?? 0,
      tone: "slate",
    },
  ];

  const roleStats = roleOptions.map((role) => ({
    ...role,
    count: dashboard?.roles?.[role.value] ?? 0,
  }));

  const maxRoleCount = Math.max(...roleStats.map((role) => role.count), 1);

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    try {
      await createAdminUser(form);
      setForm(initialForm);
      setNotice("Tạo tài khoản mới thành công");
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Không tạo được tài khoản");
    } finally {
      setSaving(false);
    }
  };

  const runUserAction = async (user, action) => {
    const userId = getUserId(user);
    setActionId(userId);
    setError("");
    setNotice("");

    try {
      await action(userId);
      await loadAdminData();
    } catch (err) {
      setError(err.message || "Thao tác thất bại");
    } finally {
      setActionId("");
    }
  };

  const handleToggleLock = (user) => {
    const action = user.isActive ? lockAdminUser : unlockAdminUser;
    runUserAction(user, action);
  };

  const handleRoleChange = (user, nextRole) => {
    runUserAction(user, (userId) => changeAdminUserRole(userId, nextRole));
  };

  const handleDeleteUser = (user) => {
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa tài khoản ${user.displayName || user.username}?`,
    );

    if (!confirmed) {
      return;
    }

    runUserAction(user, deleteAdminUser);
  };

  const renderStats = () => (
    <section className="admin-stats-grid" aria-label="Thống kê tài khoản">
      {stats.map((item) => (
        <article className={`admin-stat admin-stat-${item.tone}`} key={item.label}>
          <span>{item.label}</span>
          <strong>{loading ? "--" : item.value}</strong>
        </article>
      ))}
    </section>
  );

  const renderRolePanel = () => (
    <section className="admin-panel admin-role-panel" id="roles">
      <div className="admin-panel-header">
        <div>
          <h2>Phân bổ vai trò</h2>
          <p>Số lượng tài khoản theo từng nhóm quyền.</p>
        </div>
      </div>

      <div className="admin-role-list">
        {roleStats.map((role) => (
          <div className="admin-role-row" key={role.value}>
            <div className="admin-role-meta">
              <span>{role.label}</span>
              <strong>{role.count}</strong>
            </div>
            <div className="admin-role-track" aria-hidden="true">
              <span style={{ width: `${(role.count / maxRoleCount) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );

  const renderCreateForm = () => (
    <form
      className="admin-panel admin-create-form"
      id="create-user"
      onSubmit={handleCreateUser}
    >
      <div className="admin-panel-header">
        <div>
          <h2>Tạo tài khoản</h2>
          <p>Thêm nhanh người dùng mới vào hệ thống.</p>
        </div>
      </div>

      <label>
        Họ tên
        <input
          name="displayName"
          value={form.displayName}
          onChange={handleFormChange}
          placeholder="Nguyễn Văn A"
          required
        />
      </label>

      <label>
        Tên đăng nhập
        <input
          name="username"
          value={form.username}
          onChange={handleFormChange}
          placeholder="nguyenvana"
          required
        />
      </label>

      <label>
        Email
        <input
          name="email"
          type="email"
          value={form.email}
          onChange={handleFormChange}
          placeholder="user@vietmy.edu.vn"
          required
        />
      </label>

      <div className="admin-form-row">
        <label>
          Mật khẩu
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleFormChange}
            placeholder="Tối thiểu 6 ký tự"
            minLength={6}
            required
          />
        </label>

        <label>
          Vai trò
          <select name="role" value={form.role} onChange={handleFormChange}>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="admin-button admin-button-primary" disabled={saving}>
        {saving ? "Đang tạo..." : "Tạo tài khoản"}
      </button>
    </form>
  );

  const renderUsersPanel = () => (
    <section className="admin-panel admin-users-panel" id="users">
      <div className="admin-panel-header admin-users-header">
        <div>
          <h2>Quản lý tài khoản</h2>
          <p>{filteredUsers.length} tài khoản đang hiển thị.</p>
        </div>

        <div className="admin-filter-group">
          <input
            aria-label="Tìm kiếm tài khoản"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Tìm tên, email, username..."
          />
          <select
            aria-label="Lọc theo vai trò"
            value={roleFilter}
            onChange={(event) => setRoleFilter(event.target.value)}
          >
            <option value="all">Tất cả vai trò</option>
            {roleOptions.map((role) => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>Người dùng</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th>Ngày tạo</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="admin-empty-cell">
                  Đang tải danh sách tài khoản...
                </td>
              </tr>
            ) : filteredUsers.length ? (
              filteredUsers.map((user) => {
                const userId = getUserId(user);
                const isBusy = actionId === userId;

                return (
                  <tr key={userId}>
                    <td>
                      <div className="admin-user-cell">
                        <span className="admin-avatar">
                          {(user.displayName || user.username || "U")
                            .slice(0, 1)
                            .toUpperCase()}
                        </span>
                        <div>
                          <strong>{user.displayName || user.username}</strong>
                          <span>
                            {user.username} · {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <select
                        className="admin-role-select"
                        value={user.role}
                        disabled={isBusy}
                        onChange={(event) => handleRoleChange(user, event.target.value)}
                      >
                        {roleOptions.map((role) => (
                          <option key={role.value} value={role.value}>
                            {role.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <span
                        className={`admin-status ${
                          user.isActive ? "admin-status-active" : "admin-status-locked"
                        }`}
                      >
                        {user.isActive ? "Hoạt động" : "Đang khóa"}
                      </span>
                    </td>
                    <td>{formatDate(user.createdAt)}</td>
                    <td>
                      <div className="admin-actions">
                        <button
                          className="admin-text-button"
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleToggleLock(user)}
                        >
                          {user.isActive ? "Khóa" : "Mở khóa"}
                        </button>
                        <button
                          className="admin-text-button admin-danger"
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleDeleteUser(user)}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="admin-empty-cell">
                  Không tìm thấy tài khoản phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );

  const renderOverview = () => (
    <>
      {renderStats()}
      <section className="admin-overview-grid">
        {renderRolePanel()}

        <section className="admin-panel admin-recent-panel">
          <div className="admin-panel-header">
            <div>
              <h2>Tài khoản mới</h2>
              <p>5 người dùng được tạo gần nhất.</p>
            </div>
          </div>

          <div className="admin-recent-list">
            {loading ? (
              <div className="admin-empty-cell">Đang tải dữ liệu...</div>
            ) : users.length ? (
              users.slice(0, 5).map((user) => (
                <div className="admin-recent-item" key={getUserId(user)}>
                  <span className="admin-avatar">
                    {(user.displayName || user.username || "U")
                      .slice(0, 1)
                      .toUpperCase()}
                  </span>
                  <div>
                    <strong>{user.displayName || user.username}</strong>
                    <span>{roleOptions.find((role) => role.value === user.role)?.label}</span>
                  </div>
                  <small>{formatDate(user.createdAt)}</small>
                </div>
              ))
            ) : (
              <div className="admin-empty-cell">Chưa có tài khoản.</div>
            )}
          </div>
        </section>
      </section>
    </>
  );

  return (
    <div className="admin-dashboard">
      <section className="admin-hero" aria-labelledby="admin-title">
        <div>
          <p className="admin-eyebrow">{activeContent.eyebrow}</p>
          <h1 id="admin-title">{activeContent.title}</h1>
          <p className="admin-subtitle">{activeContent.subtitle}</p>
        </div>
        <button
          className="admin-button admin-button-secondary"
          type="button"
          onClick={loadAdminData}
          disabled={loading}
        >
          {loading ? "Đang tải..." : "Làm mới"}
        </button>
      </section>

      {error && <div className="admin-alert admin-alert-error">{error}</div>}
      {notice && <div className="admin-alert admin-alert-success">{notice}</div>}

      {activeSection === "overview" && renderOverview()}
      {activeSection === "users" && renderUsersPanel()}
      {activeSection === "create" && renderCreateForm()}
      {activeSection === "roles" && renderRolePanel()}
    </div>
  );
}
