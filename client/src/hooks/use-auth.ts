const loginGuest = async () => {
  if (user) return user;
  
  const loginTimestamp = sessionStorage.getItem('lastLoginAttempt');
  const now = Date.now();
  
  if (loginTimestamp && now - parseInt(loginTimestamp) < 5000) {
    return null;
  }
  
  sessionStorage.setItem('lastLoginAttempt', now.toString());
  
  try {
    const response = await fetch('/api/login/guest', {
      method: 'POST',
      credentials: 'include'
    });
    if (response.ok) {
      const user = await response.json();
      setUser(user);
      sessionStorage.removeItem('loginInProgress');
      return user;
    }
  } catch (error) {
    console.error('Guest login failed:', error);
  }
  sessionStorage.removeItem('loginInProgress');
  return null;
};