import React from 'react'
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { Link } from 'react-router-dom';
import { useAppHistory } from '../context/HistoryContext';

const Nav = () => {
  const { goBack, goForward, canGoBack, canGoForward } = useAppHistory();

  return (
    <nav className='nav-header'>
      <div className='nav-arrows'>
        <button
          className='arrow-btn'
          onClick={goBack}
          disabled={!canGoBack}
          title="Go back"
        >
          <FaChevronLeft style={{
            fontSize: '18px',
            color: canGoBack ? 'var(--melodify-white)' : 'var(--melodify-dim-white)'
          }} />
        </button>
        <button
          className='arrow-btn'
          onClick={goForward}
          disabled={!canGoForward}
          title="Go forward"
        >
          <FaChevronRight style={{
            fontSize: '18px',
            color: canGoForward ? 'var(--melodify-white)' : 'var(--melodify-dim-white)'
          }} />
        </button>
      </div>

      <div className='nav-auth'>
        <Link to='/signup' style={{ textDecoration: 'none' }}>
          <button className='btn-ghost'>Sign up</button>
        </Link>
        <Link to='/login' style={{ textDecoration: 'none' }}>
          <button className='btn-premium'>Log in</button>
        </Link>
      </div>
    </nav>
  )
}

export default Nav
