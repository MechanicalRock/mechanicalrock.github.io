class SeriesList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow( { mode: 'open' } );
    this.shadowRoot.innerHTML = `
      <style>
        .series-list {
          background-color: #eee;
          border-radius: 0.5em;
          border: 1px solid #d2cece;
          box-shadow: 0px 0px 10px 0 #cfcfcf;
          margin: 2em auto;
          padding: 1em;
          width: 28em;
        }
        .title {
          border-bottom: 1px solid #808080;
          font-weight: bold;
          padding-bottom: 0.8em;
        }
        .episode-list ul {
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .episode-list ul li {
          align-items: center;
          border-bottom: 1px solid #d1cece;
          cursor: pointer;
          display: flex;
          padding: 0;
        }
        .episode-list ul li a:hover, .episode-list ul li a:focus {
          background-color: #ddd9d9;
        }
        .episode-list ul li:last-child {
          border-bottom: 0;
        }
        .episode-list ul li a {
          background-color: #eee;
          transition: background-color 0.2s;
          color: inherit;
          display: block;
          height: 100%;
          outline: none;
          padding: 0.5em 0;
          text-decoration: none;
          width: 100%;
        }
        .episode-list ul li[data-active="true"] {
          font-weight: bold;
        }
        .episode-list ul li[data-active="true"] span {
          background-color: var(--color-brand);
          color: #000;
        }
        .episode-list ul li span {
          align-content: center;
          align-items: center;
          background-color: #d0cece;
          border-radius: 50%;
          border: 1px solid #d1cece;
          color: #383838;
          display: inline-flex;
          font-size: 1.1em;
          height: 1.6em;
          justify-content: center;
          line-height: 0;
          margin-right: 0.3em;
          text-align: center;
          width: 1.6em;
        }
      </style>
      <div class="series-list">
        <div class="title"></div>
        <div class="episode-list"></div>
      </div>
    `
  }

  static get observedAttributes() {
    return [ 'title', 'active', 'episodes' ];
  }

  attributeChangedCallback( attrName, oldVal, newVal ) {
    if ( oldVal !== newVal ) {
      if ( newVal === null ) {
        this[ attrName ] = null;
      }
      else {
        if ( attrName === 'episodes' ) {
          this[ attrName ] = JSON.parse( newVal, 0, 2 );
        } else {
          this[ attrName ] = newVal;
        }
      }
    }
    this.render();
  }

  render() {
    const episodeUl = document.createElement( 'ul' );
    if ( Array.isArray( this.episodes ) ) {
      for ( let i = 0; i < this.episodes.length; i++ ) {
        const episodeNumber = i + 1;
        const episodeEl = document.createElement( 'li' );
        const { label, url } = this.episodes[ i ];
        episodeEl.setAttribute( "data-active", this.active === String( episodeNumber ) );
        episodeEl.innerHTML = `<a href="${url}"><span>${episodeNumber}</span>${label}</a>`
        episodeUl.appendChild( episodeEl )
      }
      const episodeListEl = this.shadowRoot.querySelector( '.episode-list' );
      episodeListEl.textContent = '';
      episodeListEl.appendChild( episodeUl );
    }

    const titleEl = this.shadowRoot.querySelector( '.title' );
    titleEl.textContent = `${this.title}`;
  }
}
customElements.define( 'series-list', SeriesList );
