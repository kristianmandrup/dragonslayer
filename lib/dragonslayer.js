class Dragon {

  // target being hit
  // actor attacking
  slayer: {
    body: App.Model

    armor: {
      shield: Security.Authorize,
      helmet: Security.Authenticate
    }
  }

  // strike at dragon
  strike: {
    slash: Output.UI,
    blow: Output.Data
  }

  // attacks made by dragon on slayer
  beast: {
    tail: Input.Router,
    tailSwipe: Input.Route,
    breath: DataService,
    wound: Data.Adapter  
  }
}
