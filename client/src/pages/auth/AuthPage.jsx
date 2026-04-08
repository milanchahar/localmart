import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser, registerUser } from "../../services/authService";
import { getHomeByRole, saveToken } from "../../utils/auth";

const roleTabs = [
  { key: "customer", label: "Customer" },
  { key: "shop_owner", label: "Shop Owner" },
  { key: "delivery_agent", label: "Delivery Agent" },
];

export default function AuthPage({ mode = "login" }) {
  const navigate = useNavigate();
  const [role, setRole] = useState("customer");
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    password: "",
    pincode: "",
    shopName: "",
    shopAddress: "",
    category: "",
    vehicleType: "",
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const isRegister = mode === "register";

  const title = isRegister ? "Create your account" : "Login to LocalMart";
  const actionText = isRegister ? "Register" : "Login";
  const swapPath = isRegister ? "/login" : "/register";
  const swapText = isRegister ? "Already have an account? Login" : "New here? Register";

  const fields = useMemo(() => {
    if (!isRegister) {
      return ["email", "password"];
    }

    const common = ["name", "phone", "email", "password"];
    if (role === "customer") {
      return [...common, "pincode"];
    }
    if (role === "shop_owner") {
      return [...common, "shopName", "shopAddress", "category"];
    }
    return [...common, "vehicleType"];
  }, [isRegister, role]);

  const labels = {
    name: "Name",
    phone: "Phone",
    email: "Email",
    password: "Password",
    pincode: "Pincode",
    shopName: "Shop Name",
    shopAddress: "Shop Address",
    category: "Category",
    vehicleType: "Vehicle Type",
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const payload = { role };
      fields.forEach((key) => {
        payload[key] = form[key].trim();
      });

      const data = isRegister ? await registerUser(payload) : await loginUser(payload);
      saveToken(data.token);
      navigate(getHomeByRole(role), { replace: true });
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-10">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>

        <div className="mt-5 grid grid-cols-3 gap-2 rounded-lg bg-slate-100 p-1">
          {roleTabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`rounded-md px-2 py-2 text-sm ${
                role === tab.key ? "bg-white font-medium text-slate-900" : "text-slate-600"
              }`}
              onClick={() => setRole(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <form className="mt-5 space-y-3" onSubmit={onSubmit}>
          {fields.map((field) => (
            <input
              key={field}
              name={field}
              type={field === "password" ? "password" : "text"}
              placeholder={labels[field]}
              value={form[field]}
              onChange={onChange}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              required
            />
          ))}

          {err ? <p className="text-sm text-red-600">{err}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-70"
          >
            {loading ? "Please wait..." : actionText}
          </button>
        </form>

        <Link to={swapPath} className="mt-4 block text-sm text-slate-700 hover:underline">
          {swapText}
        </Link>
      </div>
    </div>
  );
}
