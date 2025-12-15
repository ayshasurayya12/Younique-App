import { Link } from "react-router-dom";

const NotAuthorized = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        Access Denied
      </h1>

      <p className="text-gray-600 mb-6 text-lg">
        You are not authorized to access this page.
      </p>

      <Link
        to="/"
        className="px-6 py-3 bg-[#B37869] text-white rounded-lg hover:bg-[#a96a5d] transition"
      >
        Go Back Home
      </Link>
    </div>
  );
};

export default NotAuthorized;
