  //Functie pentru logout
  function logout() {
    deleteallfromlocalstorage();
    window.location.href = "/";
  }

  function deleteallfromlocalstorage()
  {
    localStorage.clear();
  };
