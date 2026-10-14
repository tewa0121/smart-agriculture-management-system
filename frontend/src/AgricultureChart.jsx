
import { FaLeaf, FaSeedling } from "react-icons/fa";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

const data = [
  { month: "Jan", growth: 20 },
  { month: "Feb", growth: 35 },
  { month: "Mar", growth: 30 },
  { month: "Apr", growth: 55 },
  { month: "May", growth: 70 },
  { month: "Jun", growth: 85 },
];

function AgricultureChart() {
  return (
    <div style={{ padding: "24px", fontFamily: "Arial, sans-serif" }}>
      <h2>
        <FaLeaf style={{ color: "green" }} /> Smart Agriculture Dashboard
      </h2>

      <p>
        <FaSeedling style={{ color: "green" }} /> Crop Growth Monitoring
      </p>

      <div style={{ width: "100%", height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="growth"
              stroke="#16a34a"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default AgricultureChart;

