/*****************************************************
*  project: random string generator                  *
*  description: simple online password generator     *
*  author: horans@gmail.com                          *
*  url: https://github.com/horans/random             *
*  update: 210331                                    *
*****************************************************/
/* global Vue _ bootstrap */
const rand = {
  data () {
    return {
      init: false,
      result: null,
      history: [],
      option: {
        delay: 200,
        list: 6,
        length: {
          min: 4,
          max: 64,
          current: 16,
          shortcut: [4, 8, 16, 32, 64]
        },
        character: {
          number: { enabled: true, label: '0123456789' },
          upperCase: {
            enabled: true,
            label: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
          },
          lowerCase: {
            enabled: true,
            label: 'abcdefghijklmnopqrstuvwxyz'
          },
          symbol: {
            enabled: false,
            label: 'Special Characters',
            case: {
              period: { enabled: true, label: '.' },
              plus: { enabled: true, label: '+' },
              minus: { enabled: true, label: '-' },
              asterisk: { enabled: true, label: '*' },
              slash: { enabled: true, label: '/' },
              hash: { enabled: true, label: '#' },
              exclamation: { enabled: true, label: '!' },
              questionMark: { enabled: true, label: '?' },
              comma: { enabled: true, label: ',' },
              underscore: { enabled: true, label: '_' },
              atSign: { enabled: false, label: '@' },
              dollarSign: { enabled: false, label: '$' },
              ampersand: { enabled: false, label: '&' },
              tilde: { enabled: false, label: '~' },
              caret: { enabled: false, label: '^' },
              verticalBar: { enabled: false, label: '|' },
              parentheis: { false: false, label: '()' },
              brace: { enabled: false, label: '{}' },
              bracket: { enabled: false, label: '[]' }
            }
          }
        }
      },
      appearance: {
        tooltip: {
          trigger: null,
          list: null
        },
        toast: null
      }
    }
  },
  computed: {
    // current length of string
    l () {
      return this.option.length.current
    },
    // use lodash in template
    // stackoverflow.com/questions/37694243
    d () {
      return _
    }
  },
  methods: {
    // render output
    render () {
      let output = new Array(0)
      // create character picking pool and fill in mandatory options
      let pool = ''
      _.each(this.option.character, (v, k) => {
        if (v.enabled && k !== 'symbol') {
          pool += v.label
          output.push(this.pick(v.label))
        }
      })
      let poolSymbol = ''
      if (this.option.character.symbol.enabled) {
        _.each(this.option.character.symbol.case, (v, k) => {
          if (v.enabled) poolSymbol += v.label
        })
        output.push(this.pick(poolSymbol))
      }
      pool += poolSymbol
      for (let i = 0; i < this.l - output.length; i++) {
        output.push(null)
      }
      output = _.shuffle(output)
      // fill in non-empty slots
      for (let i = 0; i < this.l; i++) {
        if (!output[i]) output[i] = this.pick(pool)
      }
      this.result = output.join('')
    },
    // random pick character from current pool
    pick (str) {
      return str.charAt(Math.floor(Math.random() * str.length))
    },
    // copy generated string and show toast
    copy (val) {
      navigator.clipboard.writeText(val)
      this.appearance.toast.show()
    },
    // fallback to first option when all are disabled
    fallback (list) {
      let s = false
      _.each(list, (v, k) => {
        if (v.enabled) {
          s = true
          return false
        }
      })
      if (!s) {
        this.$nextTick(() => {
          _.each(list, (v, k) => {
            v.enabled = true
            return false
          })
        })
      }
    },
    // generate more with same options
    repeat () {
      if (this.history.length === this.option.list) this.history.pop()
      this.history.unshift(this.result)
      this.render()
    }
  },
  watch: {
    // generate new output when character options are changed
    option: {
      handler (nv) {
        // fallback options
        this.fallback(this.option.character)
        if (nv.character.symbol.enabled) {
          this.fallback(this.option.character.symbol.case)
        }
        // reset history
        this.history = []
        // auto generate
        this.debouncedRender()
      },
      deep: true
    }
  },
  created () {
    // debounce the output
    this.debouncedRender = _.debounce(this.render, this.option.delay)
    // debounce the copying
    this.debouncedCopy = _.debounce(this.copy, this.option.delay)
    // debounce the repeating
    this.debouncedRepeat = _.debounce(this.repeat, this.option.delay)
  },
  mounted () {
    // initialize tooltip for character options
    // getbootstrap.com/docs/5.0/components/tooltips/
    this.appearance.tooltip.trigger = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    )
    this.appearance.tooltip.list = this.appearance.tooltip.trigger.map(
      el => {
        return new bootstrap.Tooltip(el, { trigger: 'hover' })
      }
    )
    // initialize toast for copy
    this.appearance.toast = new bootstrap.Toast(
      document.querySelectorAll('.toast')[0],
      { delay: this.option.delay * 10 }
    )
    // system ready
    this.init = true
    // default ouput
    this.render()
  }
}
Vue.createApp(rand).mount('#random')
