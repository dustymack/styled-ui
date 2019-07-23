import React from 'react';
import PropTypes from 'prop-types';
import { Button } from '../../main';
import { SimpleModal } from '../../simple-modal';
import * as Styled from '../styled';
import { SearchResult } from './search-result';
import { CreateGroup } from './create-group';

const defaultResultsTopMargin = -64;

/** Large group selector for searching Faithlife groups. Can be displayed inline or inside a modal. */
export class LargeGroupSelector extends React.Component {
	static propTypes = {
		/** Toggles the modal state open and closed */
		onChangeModalState: PropTypes.func.isRequired,
		/** Keeps track of modal open/closed state */
		isOpen: PropTypes.bool.isRequired,
		/** Where search strings will be passed for application to query account services */
		onSearchInputChange: PropTypes.func.isRequired,
		/** Groups that user is a part of (can be empty array) */
		groups: PropTypes.array.isRequired,
		/** Where results from group search should be passed */
		groupSearchResults: PropTypes.array,
		/** Function called when user creates group.  Application is responsible for contacting account services */
		onCreateGroup: PropTypes.func.isRequired,
		/** Operation to perform when "Get Started" buttons are clicked */
		onGetStartedClick: PropTypes.func.isRequired,
		/** Operation to perform when user requests to claim a group */
		onClaimGroupClick: PropTypes.func.isRequired,
		/** Operation to perform when user requests to join a group */
		onJoinGroupClick: PropTypes.func.isRequired,
		/** Operation to perform when user requests to join a group */
		onAdminRequestClick: PropTypes.func.isRequired,
		/** Whether or not to show the group selector in place */
		showInPlace: PropTypes.bool,
		/** Whether or not to show the "Find Your Church in the Faithlife Group Directory" title */
		hideTitle: PropTypes.bool,
		/** Array of membership levels allowed to "Select" group. Defaults to Admin only */
		authorizedMembershipLevels: PropTypes.arrayOf(PropTypes.string),
		/** Array of group kinds user is allowed to "Select". Defaults to 'church' only */
		authorizedGroupKinds: PropTypes.arrayOf(PropTypes.string),
		/** Flag to use "Select"/"Request" button style instead of "Get Started"/"Join"/"Follow"/"Claim" */
		useSelectRequestButtonStyle: PropTypes.bool,
		/** String literals to overload UI elements and for localization */
		resources: PropTypes.shape({
			title: PropTypes.string,
			subTitle: PropTypes.string,
			requestButtonText: PropTypes.string,
			joinButtonText: PropTypes.string,
			claimButtonText: PropTypes.string,
			selectButtonText: PropTypes.string,
			dontSeeChurchText: PropTypes.string,
			goToGroupButtonText: PropTypes.string,
			churchNameText: PropTypes.string,
			churchLocationText: PropTypes.string,
			churchLocationPlaceholder: PropTypes.string,
		}),
	};

	state = {
		searchInputValue: '',
		newChurchName: '',
		newChurchLocation: '',
		modalContent: 'main',
		selectedGroupId: -1,
		createGroupFixed: false,
		resultsTopMargin: this.props.showInPlace ? 0 : defaultResultsTopMargin,
		scrollWidthDelta: 0,
	};

	componentDidMount() {
		if (this.props.showInPlace) {
			window.addEventListener('scroll', this.handleScroll);
		}
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll);
	}

	searchResultsRef = React.createRef();
	fixedCreateWrapper = false;

	createGroupClick = () => {
		this.toggle();
		this.props.onCreateGroup(this.state.newChurchName, this.state.newChurchLocation);
	};

	formatStringList = arrayOfStrings => {
		const result =
			arrayOfStrings.length === 1
				? arrayOfStrings[0]
				: [arrayOfStrings.slice(0, -1).join(', '), arrayOfStrings.slice(-1)[0]].join(
						arrayOfStrings.length < 2 ? '' : ' or ',
				  );
		return result.charAt(0).toUpperCase() + result.slice(1);
	};

	getSearchResults = () => {
		let groups;
		const groupResults = this.props.groupSearchResults || this.props.groups;

		const formattedMembershiplevels = this.formatStringList(this.props.authorizedMembershipLevels);
		const formattedGroupLevels = this.formatStringList(this.props.authorizedGroupKinds);

		if (groupResults) {
			groups = groupResults.map(group => (
				<SearchResult
					key={group.groupId}
					groupId={group.groupId}
					kind={group.kind}
					name={group.name}
					avatarUrl={group.avatarUrl}
					membershipKind={group.membershipKind}
					relationshipKind={group.relationshipKind}
					authorizedMembershipLevels={this.props.authorizedMembershipLevels}
					authorizedGroupKinds={this.props.authorizedGroupKinds}
					resources={this.props.resources}
					claimable={group.claimable}
					joinable={group.joinable}
					onGetStartedClick={this.handleGetStarted}
					onRequestClick={this.props.onAdminRequestClick}
					onEditClick={this.redirectToGroup}
					onJoinGroupClick={this.props.onJoinGroupClick}
					onClaimGroupClick={this.handleClaimGroup}
					setModalState={this.setModalState}
					setSelectedGroupId={this.setSelectedGroupId}
					onGetStarted={this.handleGetStarted}
					toggle={this.toggle}
					formattedMembershiplevels={formattedMembershiplevels}
					formattedGroupLevels={formattedGroupLevels}
				/>
			));
		}
		return groups;
	};

	toggle = () => {
		this.setState({
			createGroupFixed: false,
			resultsTopMargin: this.props.showInPlace ? 0 : defaultResultsTopMargin,
			modalContent: 'main',
		});

		this.props.onChangeModalState();
	};

	setModalState = state => {
		this.setState({ modalContent: state });
	};

	setSelectedGroupId = id => {
		this.setState({ selectedGroupId: id });
	};

	resetModalState = () => {
		this.setState({ modalContent: 'main' });
	};

	redirectToGroup = () => {
		this.setModalState('main');
		window.open(
			`https://faithlife.com/${this.state.selectedGroupId}/about`,
			'noopener, noreferrer',
		);
	};

	handleChurchNameInputChange = event => {
		this.setState({ newChurchName: event.target.value });
		this.handleSearchInput(event);
	};

	handleChurchLocationInputChange = event => {
		this.setState({ newChurchLocation: event.target.value });
		this.handleSearchInput(event);
	};

	handleSearchInput = event => {
		this.setState({
			searchInputValue: event.target.value,
		});
		if (event.target.value !== undefined && event.target.value !== ' ') {
			this.props.onSearchInputChange(event.target.value);
		}
	};

	handleKeyPress = event => {
		if (event.key === 'Enter') {
			if (event.target.value !== undefined && event.target.value !== ' ') {
				this.props.onSearchInputChange(this.state.searchInputValue);
			}
		}
	};

	handleGetStarted = groupId => {
		this.props.onGetStartedClick(groupId);
	};

	handleClaimGroup = groupId => {
		this.props.onClaimGroupClick(groupId);
	};

	handleScroll = scrollData => {
		const scrollTopPosition = this.props.showInPlace ? window.scrollY : scrollData.topPosition;

		if (scrollTopPosition >= 82 && !this.fixedCreateWrapper) {
			this.setState({
				createGroupFixed: true,
				resultsTopMargin: this.props.showInPlace ? 136 : 232,
			});
			this.fixedCreateWrapper = true;
		} else if (scrollTopPosition < 82) {
			this.setState({
				createGroupFixed: false,
				resultsTopMargin: defaultResultsTopMargin + scrollTopPosition,
			});
			this.fixedCreateWrapper = false;
		}
	};

	render() {
		const disableButton = this.state.newChurchName === '' || this.state.newChurchLocation === '';

		const formattedMembershiplevels = this.formatStringList(this.props.authorizedMembershipLevels);
		const formattedGroupLevels = this.formatStringList(this.props.authorizedGroupKinds);

		const mainView = (
			<Styled.LargeScrollView
				horizontal={false}
				contentClassName={Styled.LargeScrollViewContentClass}
				onScroll={this.handleScroll}
				showInPlace={this.props.showInPlace}
				hideTitle={this.props.hideTitle}
				verticalScrollbarStyle={{
					borderRadius: '6px',
					marginTop: '1px',
					marginBottom: '1px',
				}}
			>
				{!this.props.hideTitle && (
					<div>
						<Styled.LargeTopGradient />
						<Styled.LargeTitle>{this.props.resources.title}</Styled.LargeTitle>
						<Styled.LargeSubtitle>{this.props.resources.subTitle}</Styled.LargeSubtitle>
					</div>
				)}
				<Styled.CreateGroupWrapper fixed={this.state.createGroupFixed}>
					<Styled.CreateGroupBackground scrollWidthDelta={this.state.scrollWidthDelta}>
						<CreateGroup
							onChurchNameInputChange={this.handleChurchNameInputChange}
							onChurchLocationInputChange={this.handleChurchLocationInputChange}
							newChurchName={this.state.newChurchName}
							newChurchLocation={this.state.newChurchLocation}
							showRequiredStars={this.state.createGroupFixed}
							resources={this.props.resources}
						/>
						<Styled.CreateGroupButtonWrapper>
							<Styled.CreateGroupButtonText>
								{this.props.resources.dontSeeChurchText}
							</Styled.CreateGroupButtonText>
							<Button small primary disabled={disableButton} onClick={this.createGroupClick}>
								Create
							</Button>
						</Styled.CreateGroupButtonWrapper>
					</Styled.CreateGroupBackground>
				</Styled.CreateGroupWrapper>
				<Styled.SearchResultsContainer
					style={{ marginTop: this.state.resultsTopMargin }}
					fixed={this.state.createGroupFixed}
					ref={this.searchResultsRef}
				>
					{this.getSearchResults()}
				</Styled.SearchResultsContainer>
			</Styled.LargeScrollView>
		);

		const secondaryModalOpen =
			this.state.modalContent === 'admin' || this.state.modalContent === 'change';

		return (
			<Styled.LargeGroupSelector>
				{this.props.showInPlace && mainView}
				<SimpleModal
					container="body"
					isOpen={
						(!this.props.showInPlace && this.props.isOpen) ||
						(this.props.showInPlace && secondaryModalOpen) ||
						false
					}
					onClose={this.toggle}
					theme={{ background: 'transparent' }}
				>
					{this.state.modalContent === 'main' && !this.props.showInPlace && mainView}
					{this.state.modalContent === 'admin' && (
						<Styled.SecondaryModalContent>
							<Styled.SecondaryModalText>
								<Styled.SearchResultBoldText>
									{formattedMembershiplevels}
								</Styled.SearchResultBoldText>
								<span> membership is neccessarry to perform this action.</span>
							</Styled.SecondaryModalText>
							<Styled.SecondaryModalText>
								Contact a group administrator to request access
							</Styled.SecondaryModalText>
							<Styled.SecondaryModalButtonContainer>
								<Styled.SecondaryModalButtonWrapper>
									<Button small primary onClick={this.redirectToGroup}>
										{this.props.resources.goToGroupButtonText}
									</Button>
								</Styled.SecondaryModalButtonWrapper>
								<Button small onClick={this.resetModalState}>
									Cancel
								</Button>
							</Styled.SecondaryModalButtonContainer>
						</Styled.SecondaryModalContent>
					)}
					{this.state.modalContent === 'change' && (
						<Styled.SecondaryModalContent>
							<Styled.SecondaryModalText>
								This group type must be set to{' '}
								<Styled.SearchResultBoldText>{formattedGroupLevels}</Styled.SearchResultBoldText>
							</Styled.SecondaryModalText>
							<Styled.SecondaryModalText>
								Visit the group settings page to change
							</Styled.SecondaryModalText>
							<Styled.SecondaryModalButtonContainer>
								<Styled.SecondaryModalButtonWrapper>
									<Button small primary onClick={this.redirectToGroup}>
										Change to {formattedGroupLevels}
									</Button>
								</Styled.SecondaryModalButtonWrapper>
								<Button small onClick={this.resetModalState}>
									Cancel
								</Button>
							</Styled.SecondaryModalButtonContainer>
						</Styled.SecondaryModalContent>
					)}
				</SimpleModal>
			</Styled.LargeGroupSelector>
		);
	}
}

LargeGroupSelector.defaultProps = {
	authorizedMembershipLevels: ['admin'],
	authorizedGroupKinds: ['church'],
	resources: {
		title: 'Find Your Church',
		subTitle: 'in the Faithlife Church Directory',
		requestButtonText: 'Request Admin',
		joinButtonText: 'Join Group',
		claimButtonText: 'Claim',
		selectButtonText: 'Get Started',
		dontSeeChurchText: "Don't see your church?",
		goToGroupButtonText: 'Request Access',
		churchNameText: 'Church Name',
		churchLocationText: 'Church Location',
		churchLocationPlaceholder: 'City, State',
	},
};
