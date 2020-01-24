import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import Error from './Error';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Membership from './Membership';
import { Button } from 'react-bootstrap';

const MEMBERSHIPS_PER_PAGE = 10;

class MembershipsWithData extends React.Component {
  static propTypes = {
    memberCollectiveSlug: PropTypes.string,
    orderBy: PropTypes.string,
    limit: PropTypes.number,
    onChange: PropTypes.func,
    LoggedInUser: PropTypes.object,
    fetchMore: PropTypes.func,
    refetch: PropTypes.func,
    data: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.fetchMore = this.fetchMore.bind(this);
    this.refetch = this.refetch.bind(this);
    this.onChange = this.onChange.bind(this);
    this.state = {
      role: null,
      loading: false,
    };
  }

  componentDidMount() {
    this.onChange();
  }

  onChange() {
    const { onChange } = this.props;
    onChange && this.node && onChange({ height: this.node.offsetHeight });
  }

  fetchMore(e) {
    e.target.blur();
    this.setState({ loading: true });
    this.props.fetchMore().then(() => {
      this.setState({ loading: false });
      this.onChange();
    });
  }

  refetch(role) {
    this.setState({ role });
    this.props.refetch({ role });
  }

  render() {
    const { data, LoggedInUser } = this.props;

    if (data.error) {
      return <Error message={data.error.message} />;
    }
    if (!data.allMembers) {
      return <div />;
    }
    const memberships = [...data.allMembers];
    if (memberships.length === 0) {
      return <div />;
    }

    const collectiveIds = [];

    const groupedMemberships = memberships.reduce((_memberships, m) => {
      (_memberships[m.collective.id] = _memberships[m.collective.id] || []).push(m);
      if (collectiveIds.length == 0 || collectiveIds[collectiveIds.length - 1] != m.collective.id) {
        collectiveIds.push(m.collective.id);
      }
      return _memberships;
    }, {});

    const limit = this.props.limit || MEMBERSHIPS_PER_PAGE * 2;
    return (
      <div className="MembersContainer" ref={node => (this.node = node)}>
        <style jsx>
          {`
            :global(.loadMoreBtn) {
              margin: 1rem;
              text-align: center;
            }
            .Collectives {
              display: flex;
              flex-wrap: wrap;
              flex-direction: row;
              justify-content: center;
              overflow: hidden;
              margin: 1rem 0;
            }
          `}
        </style>

        <div className="Collectives cardsList">
          {collectiveIds.map(id => (
            <Membership key={id} memberships={groupedMemberships[id]} LoggedInUser={LoggedInUser} />
          ))}
        </div>
        {memberships.length % 10 === 0 && memberships.length >= limit && (
          <div className="loadMoreBtn">
            <Button bsStyle="default" onClick={this.fetchMore}>
              {this.state.loading && <FormattedMessage id="loading" defaultMessage="loading" />}
              {!this.state.loading && <FormattedMessage id="loadMore" defaultMessage="load more" />}
            </Button>
          </div>
        )}
      </div>
    );
  }
}

const getMembershipsQuery = gql`
  query Members($memberCollectiveSlug: String, $role: String, $limit: Int, $offset: Int, $orderBy: String) {
    allMembers(
      memberCollectiveSlug: $memberCollectiveSlug
      role: $role
      limit: $limit
      offset: $offset
      orderBy: $orderBy
    ) {
      id
      role
      createdAt
      stats {
        totalDonations
      }
      tier {
        id
        name
      }
      collective {
        id
        type
        name
        currency
        description
        slug
        imageUrl
        backgroundImage
        stats {
          id
          backers {
            all
          }
          yearlyBudget
        }
        parentCollective {
          slug
        }
      }
    }
  }
`;

export const addMembershipsData = graphql(getMembershipsQuery, {
  options(props) {
    return {
      variables: {
        memberCollectiveSlug: props.memberCollectiveSlug,
        offset: 0,
        role: props.role,
        orderBy: props.orderBy || 'totalDonations',
        limit: props.limit || MEMBERSHIPS_PER_PAGE * 2,
      },
    };
  },
  props: ({ data }) => ({
    data,
    fetchMore: () => {
      return data.fetchMore({
        variables: {
          offset: data.allMembers.length,
          limit: MEMBERSHIPS_PER_PAGE,
        },
        updateQuery: (previousResult, { fetchMoreResult }) => {
          if (!fetchMoreResult) {
            return previousResult;
          }
          return Object.assign({}, previousResult, {
            // Append the new posts results to the old one
            allMembers: [...previousResult.allMembers, ...fetchMoreResult.allMembers],
          });
        },
      });
    },
  }),
});

export default addMembershipsData(MembershipsWithData);
