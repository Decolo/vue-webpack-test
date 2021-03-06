<template>
  <div class="infinite-loading-container">
    <div v-show="isLoading">
      <slot name="spinner">
        <i :class="spinnerType"></i>
      </slot>
    </div>
    <div class="infinite-status-prompt" v-show="!isLoading && isComplete && isFirstLoad">
      <slot name="no-results">No results :(</slot>
    </div>
    <div class="infinite-status-prompt" v-show="!isLoading && isComplete && !isFirstLoad">
      <slot name="no-more">No more data :)</slot>
    </div>
  </div>
</template>
<script>
  const spinnerMapping = {
    bubbles: 'loading-bubbles',
    circles: 'loading-circles',
    default: 'loading-default',
    spiral: 'loading-spiral',
    waveDots: 'loading-wave-dots',
  };

  /**
   * get the first scroll parent of an element
   * @param  {DOM} elm    the element which find scorll parent
   * @return {DOM}        the first scroll parent
   */
  function getScrollParent(elm) {
    if (elm.tagName === 'BODY') {
      return window;
    } else if (['scroll', 'auto'].indexOf(getComputedStyle(elm).overflowY) > -1) {
      return elm;
    }
    return getScrollParent(elm.parentNode);
  }

  /**
   * get current distance from footer
   * @param  {DOM} elm    scroll element
   * @return {Number}     distance
   */
  function getCurrentDistance(elm) {
    const styles = getComputedStyle(elm === window ? document.body : elm);
    const innerHeight = elm === window
                      ? window.innerHeight
                      : parseInt(styles.height, 10);
    const scrollHeight = elm === window
                       ? document.body.scrollHeight
                       : elm.scrollHeight;
    const scrollTop = isNaN(elm.scrollTop) ? elm.pageYOffset : elm.scrollTop;
    const paddingTop = parseInt(styles.paddingTop, 10);
    const paddingBottom = parseInt(styles.paddingBottom, 10);

    return scrollHeight - innerHeight - scrollTop - paddingTop - paddingBottom;
  }

  export default {
    data() {
      return {
        scrollParent: null,
        scrollHandler: null,
        isLoading: false,
        isComplete: false,
        isFirstLoad: true, // save the current loading whether it is the first loading
      };
    },
    computed: {
      spinnerType() {
        return spinnerMapping[this.spinner] || spinnerMapping.default;
      },
    },
    props: {
      distance: {
        type: Number,
        default: 100,
      },
      onInfinite: Function,
      spinner: String,
    },
    mounted() {
      this.scrollParent = getScrollParent(this.$el);

      this.scrollHandler = function scrollHandlerOriginal() {
        const currentDistance = getCurrentDistance(this.scrollParent); 
        if ( (!this.isLoading && !this.isComplete && currentDistance <= this.distance) || this.isFirstLoad  ) {
          this.isLoading = true;
          if (this.onInfinite) {
            this.onInfinite.call();
          }
        }
      }.bind(this);

      setTimeout(this.scrollHandler, 1);
      this.scrollParent.addEventListener('scroll', this.scrollHandler);

      this.$on('$InfiniteLoading:loaded', () => {
        this.isLoading = false; 
        this.isFirstLoad = false;
        setTimeout(this.scrollHandler, 1);
      });
      this.$on('$InfiniteLoading:complete', () => {
        this.isLoading = false;
        this.isComplete = true;
        this.scrollParent.removeEventListener('scroll', this.scrollHandler);
      });
      this.$on('$InfiniteLoading:reset', () => {
        this.isLoading = false;
        this.isComplete = false;
        this.isFirstLoad = true;
        this.scrollParent.removeEventListener('scroll', this.scrollHandler);
        this.scrollParent.addEventListener('scroll', this.scrollHandler);
        setTimeout(this.scrollHandler, 1);
      });
    },
    destroyed() {
      if (!this.isComplete) {
        this.scrollParent.removeEventListener('scroll', this.scrollHandler);
      }
    },
  };
</script> 