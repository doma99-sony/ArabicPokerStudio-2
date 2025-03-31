const loginGuest = async () => {
  if (user) return user;

  const loginInProgress = sessionStorage.getItem('loginInProgress');
  if (loginInProgress) return null;

  try {
    sessionStorage.setItem('loginInProgress', 'true');
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