import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gray-800 p-4">
      <ul className="flex space-x-4">
        <li>
          <Link to="/" className="text-white hover:text-gray-400">
            Home
          </Link>
        </li>
        <li>
          <Link to="/cameras" className="text-white hover:text-gray-400">
            Cameras
          </Link>
        </li>
        <li>
          <Link to="/user" className="text-white hover:text-gray-400">
            User
          </Link>
        </li>
      </ul>
    </nav>
  );
}
